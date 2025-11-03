import { Card, Row, Col, Button } from 'antd';
import { ExperimentOutlined } from '@ant-design/icons';
import DashboardLayout from '@/components/DashboardLayout';

export default function Category() {
  const leftCategories = ['OBR', 'Blood', 'XXXX'];
  
  const rightItems = [
    { category: 'Blood', items: ['1. PID / OBX', '2. PID / OBX', '1. PID / OBX', '2. PID / OBX', '2. PID / OBX'] }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <Card className="shadow-sm">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Category</h2>
          
          <Row gutter={24}>
            {/* Left Column - Categories */}
            <Col xs={24} md={8}>
              <div className="space-y-3">
                {leftCategories.map((category, index) => (
                  <Button
                    key={index}
                    size="large"
                    className="w-full h-14 text-lg font-medium"
                    type={index === 0 ? 'primary' : 'default'}
                    icon={<ExperimentOutlined />}
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </Col>

            {/* Right Column - Items */}
            <Col xs={24} md={16}>
              <div className="space-y-4">
                {rightItems.map((section, sectionIndex) => (
                  <div key={sectionIndex}>
                    <div className="bg-purple-100 border border-purple-300 rounded-lg p-3 mb-3">
                      <h3 className="text-lg font-semibold text-purple-800">{section.category}</h3>
                    </div>
                    
                    <div className="space-y-2">
                      {section.items.map((item, itemIndex) => (
                        <div
                          key={itemIndex}
                          className="bg-purple-200 border border-purple-400 rounded-lg p-4 hover:bg-purple-300 transition-colors cursor-pointer"
                        >
                          <p className="text-purple-900 font-medium">{item}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Col>
          </Row>
        </Card>
      </div>
    </DashboardLayout>
  );
}
