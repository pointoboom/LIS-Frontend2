import { Card, Button, Row, Col, Tag } from 'antd';
import { ClockCircleOutlined, FileTextOutlined, AppstoreOutlined } from '@ant-design/icons';
import DashboardLayout from '@/components/DashboardLayout';
import { useLocation } from 'wouter';

export default function Dashboard() {
  const [, setLocation] = useLocation();

  const latestItems = [
    { id: 1, label: 'Latest', time: '10 mins ago' },
    { id: 2, label: 'Latest', time: '15 mins ago' },
    { id: 3, label: 'Latest', time: '20 mins ago' },
    { id: 4, label: 'Latest', time: '25 mins ago' },
    { id: 5, label: 'Latest', time: '28 mins ago' },
    { id: 6, label: 'Latest', time: '29 mins ago' },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Scan Results Header */}
        <Card className="shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ClockCircleOutlined className="text-2xl text-blue-500" />
              <div>
                <h2 className="text-xl font-semibold text-gray-800">Scan Results</h2>
                <p className="text-gray-600">Last updated: &lt; 30 mins</p>
              </div>
            </div>
            <Tag color="green" className="text-lg px-4 py-1">Active</Tag>
          </div>
        </Card>

        {/* Quick Actions */}
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8}>
            <Card 
              hoverable 
              className="shadow-sm cursor-pointer"
              onClick={() => setLocation('/dashboard/reports')}
            >
              <div className="flex items-center gap-3">
                <FileTextOutlined className="text-3xl text-purple-500" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Reports</h3>
                  <p className="text-gray-600">View all reports</p>
                </div>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Card 
              hoverable 
              className="shadow-sm cursor-pointer"
              onClick={() => setLocation('/dashboard/category')}
            >
              <div className="flex items-center gap-3">
                <AppstoreOutlined className="text-3xl text-orange-500" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Category</h3>
                  <p className="text-gray-600">Browse categories</p>
                </div>
              </div>
            </Card>
          </Col>
        </Row>

        {/* Latest Results */}
        <Card title="Latest Results" className="shadow-sm">
          <Row gutter={[16, 16]}>
            {latestItems.map((item) => (
              <Col xs={12} sm={8} md={6} lg={4} key={item.id}>
                <Button 
                  type="primary" 
                  size="large"
                  className="w-full h-24 flex flex-col items-center justify-center"
                  ghost
                  onClick={() => setLocation(`/dashboard/reports?id=${item.id}`)}
                >
                  <span className="text-lg font-semibold">{item.label}</span>
                  <span className="text-xs mt-1">{item.time}</span>
                </Button>
              </Col>
            ))}
          </Row>
        </Card>
      </div>
    </DashboardLayout>
  );
}
