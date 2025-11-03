import { Card, Empty } from 'antd';
import DashboardLayout from '@/components/DashboardLayout';

export default function Blood() {
  return (
    <DashboardLayout>
      <Card className="shadow-sm">
        <Empty
          description="Blood page - Coming soon"
          className="py-12"
        />
      </Card>
    </DashboardLayout>
  );
}
