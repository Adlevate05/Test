import React from "react";
import MultiSettingsStyle, {
  type ProductListItem,
} from "./Drop-down/Multi-Settings-Style";
import VolumeDiscount from "./Drop-down/Volume-Discount";
import BarItems3 from "./Drop-down/Bar-Items-3";

interface DropDownProps {
  products: ProductListItem[];
}

export default function DropDown3({ products }: DropDownProps) {
  return (
    <>
      <div className="w-full space-y-5 ">
        <MultiSettingsStyle products={products} />
        <VolumeDiscount products={products} />
        <BarItems3 />
      </div>
    </>
  );
}
