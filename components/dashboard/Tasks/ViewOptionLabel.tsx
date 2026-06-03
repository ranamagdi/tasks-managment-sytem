import { type ViewOption } from "../../../lib/utils/constants";
import Image from "next/image";
export function ViewOptionLabel({ data }: { data: ViewOption }) {
  return (
    <div className="flex items-center gap-2">
      {typeof data.icon === "string" ? (
        <Image src={data.icon} width={16} height={16} alt={data.label} />
      ) : (
        data.icon
      )}
      <span>{data.label}</span>
    </div>
  );
}
