import { ReferralNode } from './ReferralNode';

export const ReferralTree = ({ data }) => {
  if (!data) return null;

  return (
    <div className="space-y-1">
      <ReferralNode node={data} depth={0} />
    </div>
  );
};
