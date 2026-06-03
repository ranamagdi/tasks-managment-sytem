"use client";
import React from "react";
import Image, { type StaticImageData } from "next/image";
type EmptyContentProps = {
  image?: string | StaticImageData;
  title?: string;
  className?: string;
  description?: string;
  children?: React.ReactNode;
};

const EmptyContent = ({
  image,
  title = "No Data",
  description = "Nothing to show here yet.",
  className,
  children,
}: EmptyContentProps) => {
  return (
    <div className="flex flex-col justify-center items-center text-center py-10 px-4">
      {image && (
        <div className={className}>
          <Image
            src={image}
            alt="empty"
            loading="eager"
            className="w-60 h-auto mb-6 object-contain"
            style={{ height: "auto" }}
          />
        </div>
      )}

      <h3 className="text-[#041B3C] font-semibold text-[28px] mb-2 mt-3">
        {title}
      </h3>

      <p className="text-[16px] text-[#434654] max-w-md mb-6">{description}</p>

      {children}
    </div>
  );
};

export default EmptyContent;
