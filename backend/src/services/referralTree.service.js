const User = require('../models/User');
const logger = require('../utils/logger');

const MAX_DEPTH = 10;

/**
 * Builds the complete referral tree for a given user.
 *
 * Approach: Materialized Path (ancestors array)
 * - The User model stores an `ancestors` array with { user, level } for each
 *   ancestor in the referral chain. This is a materialized path pattern.
 * - We fetch ALL descendants in a SINGLE query: { 'ancestors.user': userId }
 * - The tree is assembled in memory by filtering descendants by parent ID
 *   at each level. This is O(n) where n = total descendants.
 *
 * Why not $graphLookup:
 * - $graphLookup traverses the graph at query time, which is expensive
 *   for deep trees and does not leverage the pre-computed ancestors array.
 * - Our approach uses one indexed query + in-memory assembly, which is
 *   faster and more predictable for this use case.
 *
 * @param {ObjectId} userId - The root user ID
 * @param {number} depth - Maximum tree depth to traverse
 * @returns {Object} Nested tree structure
 */
const buildReferralTree = async (userId, depth = MAX_DEPTH) => {
  const safeDepth = Math.min(Math.max(1, depth), MAX_DEPTH);

  const rootUser = await User.findById(userId)
    .select('fullName referralCode status createdAt totalRoiEarned totalLevelIncome walletBalance')
    .lean();

  if (!rootUser) {
    throw Object.assign(new Error('User not found'), { statusCode: 404 });
  }

  const descendants = await User.find({ 'ancestors.user': userId })
    .select('fullName referralCode status createdAt referredBy ancestors totalRoiEarned totalLevelIncome walletBalance')
    .lean();

  logger.debug('Fetched descendants for tree', {
    userId: userId.toString(),
    descendantCount: descendants.length,
    depth: safeDepth,
  });

  const descendantsByParent = buildParentMap(descendants);

  const rootNode = buildNode(rootUser, 0, safeDepth, descendantsByParent);

  return rootNode;
};

/**
 * Groups descendants by their direct parent ID for O(1) child lookups.
 *
 * For each descendant, the direct parent is the ancestor at
 * level (descendant's level in ancestors - 1). Since ancestors are stored
 * ordered by level, the parent of a user at ancestors[i] is at ancestors[i-1].
 *
 * We use the highest-level ancestor (last in the array) as the direct parent
 * for level-1 children of the root, and ancestors[level-2] for deeper levels.
 *
 * @param {Array} descendants - Flat array of all descendant users
 * @returns {Map} Map<parentId.toString(), Array<descendant>>
 */
const buildParentMap = (descendants) => {
  const map = new Map();

  for (const desc of descendants) {
    if (!desc.ancestors || desc.ancestors.length === 0) continue;

    const directParent = desc.ancestors[desc.ancestors.length - 1];
    if (!directParent) continue;

    const parentId = directParent.user.toString();
    if (!map.has(parentId)) {
      map.set(parentId, []);
    }
    map.get(parentId).push(desc);
  }

  return map;
};

/**
 * Builds a single tree node with its children recursively.
 *
 * @param {Object} user - The user document (lean)
 * @param {number} currentLevel - Current depth level
 * @param {number} maxDepth - Maximum allowed depth
 * @param {Map} descendantsByParent - Parent-to-children map
 * @returns {Object} Tree node with children array
 */
const buildNode = (user, currentLevel, maxDepth, descendantsByParent) => {
  const node = {
    _id: user._id,
    fullName: user.fullName,
    referralCode: user.referralCode,
    status: user.status,
    createdAt: user.createdAt,
    totalRoiEarned: user.totalRoiEarned || 0,
    totalLevelIncome: user.totalLevelIncome || 0,
    walletBalance: user.walletBalance || 0,
    level: currentLevel,
    children: [],
  };

  if (currentLevel >= maxDepth) {
    return node;
  }

  const children = descendantsByParent.get(user._id.toString()) || [];

  children.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

  node.children = children.map((child) =>
    buildNode(child, currentLevel + 1, maxDepth, descendantsByParent)
  );

  return node;
};

/**
 * Returns summary statistics for a user's referral tree.
 *
 * @param {ObjectId} userId - The root user ID
 * @returns {Object} Tree statistics
 */
const getReferralTreeStats = async (userId) => {
  const descendants = await User.find({ 'ancestors.user': userId })
    .select('ancestors status totalRoiEarned totalLevelIncome walletBalance')
    .lean();

  const totalReferrals = descendants.length;
  const activeReferrals = descendants.filter((d) => d.status === 'active').length;

  const levelCounts = {};
  let totalTeamRoi = 0;
  let totalTeamLevelIncome = 0;
  let totalTeamWallet = 0;

  for (const desc of descendants) {
    const level = desc.ancestors.length;
    levelCounts[level] = (levelCounts[level] || 0) + 1;
    totalTeamRoi += desc.totalRoiEarned || 0;
    totalTeamLevelIncome += desc.totalLevelIncome || 0;
    totalTeamWallet += desc.walletBalance || 0;
  }

  return {
    totalReferrals,
    activeReferrals,
    inactiveReferrals: totalReferrals - activeReferrals,
    levelCounts,
    maxDepth: totalReferrals > 0 ? Math.max(...Object.keys(levelCounts).map(Number)) : 0,
    earnings: {
      totalTeamRoi,
      totalTeamLevelIncome,
      totalTeamWallet,
    },
  };
};

module.exports = { buildReferralTree, getReferralTreeStats, MAX_DEPTH };
