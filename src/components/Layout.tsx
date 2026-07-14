import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Assistant, AssistantFab } from './Assistant';

export function Layout() {
  return (
    <>
      <Sidebar />
      <main className="main">
        <Outlet />
      </main>
      <Assistant />
      <AssistantFab />
    </>
  );
}
