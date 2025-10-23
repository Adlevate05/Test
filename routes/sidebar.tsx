import { Icon, Frame } from "@shopify/polaris";
import { Link, useLocation } from "@remix-run/react";
import { HomeIcon, ProductIcon, CollectionIcon, PageIcon, BlogIcon, SettingsIcon } from "@shopify/polaris-icons";

export default function SideBar() {
  const location = useLocation();

  return (
    <aside className="sidebar static left-0 top-0 z-9999 w-[200px] h-screen overflow-y-hidden">
      <Frame>
        <div className="pt-3 px-3 h-screen flex flex-col">
          <Link
            to="/app"
            className={`flex items-center gap-2 px-2 py-1 rounded-md font-bold text-gray-800 ${location.pathname === "/app" ? "bg-white" : "hover:bg-gray-200"}`}
          >
            <Icon source={HomeIcon} />
            <span className="">Dashboard</span>
          </Link>

          <Link
            to="/app/products"
            className={`flex items-center gap-2 px-2 py-1 rounded-md font-bold text-gray-800 ${location.pathname === "/app/products" ? "bg-white" : "hover:bg-gray-200"}`}
          >
            <Icon source={ProductIcon} />
            <span className="">Products</span>
          </Link>

          <Link
            to="/app/collections"
            className={`flex items-center gap-2 px-2 py-1 rounded-md font-bold text-gray-800 ${location.pathname === "/app/collections" ? "bg-white" : "hover:bg-gray-200"}`}
          >
            <Icon source={CollectionIcon} />
            <span className="">Collections</span>
          </Link>

          <Link
            to="/app/pages"
            className={`flex items-center gap-2 px-2 py-1 rounded-md font-bold text-gray-800 ${location.pathname === "/app/pages" ? "bg-white" : "hover:bg-gray-200"}`}
          >
            <Icon source={PageIcon} />
            <span className="">Pages</span>
          </Link>

          <Link
            to="/app/blogs"
            className={`flex items-center gap-2 px-2 py-1 rounded-md font-bold text-gray-800 ${location.pathname === "/app/blogs" ? "bg-white" : "hover:bg-gray-200"}`}
          >
            <Icon source={BlogIcon} />
            <span className="">Blogs</span>
          </Link>

          <Link
            to="/app/settings"
            className={`flex items-center gap-2 px-2 py-1 rounded-md font-bold text-gray-800 ${location.pathname === "/app/settings" ? "bg-white" : "hover:bg-gray-200"}`}
          >
            <Icon source={SettingsIcon} />
            <span className="">Settings</span>
          </Link>

          <Link
            to="/app/privacy-policy"
            className={`flex items-center gap-2 px-2 py-1 rounded-md font-bold text-gray-800 ${location.pathname === "/app/privacy-policy" ? "bg-white" : "hover:bg-gray-200"} mt-5`}
          >
            <span className="">Privacy Policy</span>
          </Link>

          <Link
            to="/app/terms-of-service"
            className={`flex items-center gap-2 px-2 py-1 rounded-md font-bold text-gray-800 ${location.pathname === "/app/terms-of-service" ? "bg-white" : "hover:bg-gray-200"}`}
          >
            <span className="">Terms of Service</span>
          </Link>
        </div>
      </Frame>
    </aside>
  );
}
