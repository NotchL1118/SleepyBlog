import { FC, PropsWithChildren } from "react";

const ItemContainer: FC<PropsWithChildren<{ title?: string; className?: string }>> = ({
  title,
  children,
  className,
}) => {
  return (
    <div className={`w-full rounded-2xl bg-white shadow-md ${className}`}>
      <div className="p-4">
        <p className="text-center text-sm">{title}</p>
        {children}
      </div>
    </div>
  );
};

export default ItemContainer;
