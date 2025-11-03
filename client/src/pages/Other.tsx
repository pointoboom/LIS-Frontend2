import { Card, Empty } from 'antd';
import DashboardLayout from '@/components/DashboardLayout';

export default function Other() {
  return (
    <DashboardLayout>
      <Card className="shadow-sm">
        <Empty
          description="XXXX page - Coming soon"
          className="py-12"
        />
      </Card>
    </DashboardLayout>
  );
}
