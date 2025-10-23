import React from "react";
import BogoSettingsStyle, {
  type ProductListItem,
} from "./Drop-down/Bogo-Settings-Style";
import BarItems2 from "./Drop-down/Bar-Items-2";

interface DropDownProps {
  products: ProductListItem[];
}

export default function DropDown2({
  products,
}: DropDownProps) {
  return (
    <>
      <div className="w-full space-y-5 ">
        <BogoSettingsStyle products={products} />
        <BarItems2 />
      </div>
    </>
  );
}
