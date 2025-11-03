import { Menu } from 'antd';
import { DashboardOutlined, ExperimentOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { useLocation } from 'wouter';
import type { MenuProps } from 'antd';

type MenuItem = Required<MenuProps>['items'][number];

export default function Sidebar() {
  const [location, setLocation] = useLocation();

  const items: MenuItem[] = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    {
      key: '/dashboard/blood',
      icon: <ExperimentOutlined />,
      label: 'Blood',
    },
    {
      key: '/dashboard/other',
      icon: <QuestionCircleOutlined />,
      label: 'XXXX',
    },
  ];

  const handleMenuClick = (e: any) => {
    setLocation(e.key);
  };

  return (
    <div className="h-full bg-white border-r border-gray-200">
      <div className="p-6 border-b border-gray-200 bg-gray-50">
        <h2 className="text-xl font-bold text-gray-800">Admin Panel</h2>
        <p className="text-gray-500 text-sm mt-1">Management System</p>
      </div>
      <Menu
        mode="inline"
        selectedKeys={[location]}
        items={items}
        onClick={handleMenuClick}
        className="border-0 pt-4"
      />
    </div>
  );
}
