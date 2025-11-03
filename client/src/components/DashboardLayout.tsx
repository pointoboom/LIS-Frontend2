import { Layout, Button, Drawer } from 'antd';
import { LogoutOutlined, MenuOutlined } from '@ant-design/icons';
import { useLocation } from 'wouter';
import { useState } from 'react';
import Sidebar from './Sidebar';

const { Header, Sider, Content } = Layout;

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [, setLocation] = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    setLocation('/login');
  };

  return (
    <Layout className="min-h-screen">
      {/* Desktop Sidebar - visible on medium screens and up */}
      <Sider width={250} className="bg-white hidden md:block">
        <Sidebar />
      </Sider>
      
      {/* Mobile Drawer - visible on small screens */}
      <Drawer
        title="Menu"
        placement="left"
        onClose={() => setDrawerOpen(false)}
        open={drawerOpen}
        styles={{ body: { padding: 0 } }}
      >
        <Sidebar />
      </Drawer>
      
      <Layout>
        <Header className="bg-gray-50 border-b border-gray-200 px-6 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            {/* Hamburger Menu - visible only on small screens */}
            <Button
              icon={<MenuOutlined />}
              type="text"
              size="large"
              onClick={() => setDrawerOpen(true)}
              className="md:hidden"
            />
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
              <p className="text-sm text-gray-500">Welcome back, Admin</p>
            </div>
          </div>
          <Button 
            icon={<LogoutOutlined />} 
            onClick={handleLogout}
            type="text"
            danger
            size="large"
          >
            Logout
          </Button>
        </Header>
        <Content className="p-6 bg-gray-50">
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}
