import { createContext, useState, ReactNode } from 'react';
import MenuIcon from '../../../UI/Icons/Menu';

interface SidebarContext {
  expanded: boolean;
  setExpanded: React.Dispatch<React.SetStateAction<boolean>>;
}

export const SidebarContext = createContext<SidebarContext>({
  expanded: true,
  setExpanded: () => {},
});

interface SidebarProps {
  children: ReactNode;
}

export default function Sidebar({ children }: SidebarProps) {
  const [expanded, setExpanded] = useState(true);

  return (
    <aside className="h-screen">
      <nav className="h-full flex flex-col bg-white border-r shadow-sm">
        <div className="p-2 flex justify-between items-center">
          <button
            onClick={() => setExpanded((curr) => !curr)}
            className="p-1 rounded-lg bg-gray-50 hover:bg-gray-100"
          >
            <MenuIcon />
          </button>
        </div>

        <SidebarContext.Provider value={{ expanded, setExpanded }}>
          <ul className="flex-1 px-2">{children}</ul>
        </SidebarContext.Provider>

        <div className="border-t flex p-3">
          <div
            className={`flex justify-between items-center overflow-hidden transition-all ${
              expanded ? 'w-52 ml-3' : 'w-0'
            }`}
          >
            <div className="leading-4">
              <h4 className="font-semibold">constGenius</h4>
              <span className="text-xs text-gray-600">
                constgenius@gmail.com
              </span>
            </div>
          </div>
        </div>
      </nav>
    </aside>
  );
}
