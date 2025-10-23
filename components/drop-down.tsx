import React from "react";
import SettingsStyle, { type ProductListItem } from '../components/drop-down/Settings-Style'
import BarItems from '../components/drop-down/Bar-Items';

interface DropDownProps {
    products: ProductListItem[]; 
}

export default function DropDown({ products}: DropDownProps) {
    return (
        <>
          <div className="w-full space-y-5 " >
            <SettingsStyle products={products} />
            <BarItems />
          </div>
        </>
    );
}
