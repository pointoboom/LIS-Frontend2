import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FlaskConical } from 'lucide-react';
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
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Category</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Left Column - Categories */}
              <div className="space-y-3">
                {leftCategories.map((category, index) => (
                  <Button
                    key={index}
                    className={`w-full h-14 text-lg font-medium flex items-center gap-2 ${index === 0 ? '' : ''}`}
                  >
                    <FlaskConical className="w-5 h-5" /> {category}
                  </Button>
                ))}
              </div>
              {/* Right Column - Items (spans two columns on md+) */}
              <div className="md:col-span-2 space-y-4">
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
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
