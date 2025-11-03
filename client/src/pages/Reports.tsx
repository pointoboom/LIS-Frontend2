import { Card, Button, Space, Divider, Tag } from 'antd';
import { FilePdfOutlined, FileImageOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import DashboardLayout from '@/components/DashboardLayout';
import { toast } from 'sonner';
import { useLocation } from 'wouter';

export default function Reports() {
  const [location, setLocation] = useLocation();
  
  // Get ID from URL query parameter
  const urlParams = new URLSearchParams(window.location.search);
  const reportId = urlParams.get('id') || 'general';

  // Mock data for different reports
  const reportData: Record<string, any> = {
    '1': { patient: 'John Doe', pid: 'PID-001', obr: 'Blood Test', results: ['Hemoglobin: 14.5 g/dL', 'WBC: 7,200/μL', 'Platelets: 250,000/μL'] },
    '2': { patient: 'Jane Smith', pid: 'PID-002', obr: 'Urinalysis', results: ['pH: 6.5', 'Protein: Negative', 'Glucose: Normal'] },
    '3': { patient: 'Bob Johnson', pid: 'PID-003', obr: 'Lipid Panel', results: ['Total Cholesterol: 180 mg/dL', 'LDL: 100 mg/dL', 'HDL: 55 mg/dL'] },
    '4': { patient: 'Alice Brown', pid: 'PID-004', obr: 'Liver Function', results: ['ALT: 25 U/L', 'AST: 30 U/L', 'Bilirubin: 0.8 mg/dL'] },
    '5': { patient: 'Charlie Wilson', pid: 'PID-005', obr: 'Kidney Function', results: ['Creatinine: 1.0 mg/dL', 'BUN: 15 mg/dL', 'eGFR: 90 mL/min'] },
    '6': { patient: 'Diana Davis', pid: 'PID-006', obr: 'Thyroid Panel', results: ['TSH: 2.5 μIU/mL', 'T4: 8.0 μg/dL', 'T3: 120 ng/dL'] },
    'general': { patient: 'General Report', pid: 'PID-XXX', obr: 'General Observation', results: ['Test Result 1: 120 mg/dL', 'Test Result 2: Normal', 'Test Result 3: 98.6°F'] }
  };

  const currentReport = reportData[reportId] || reportData['general'];

  const handleExport = (format: string) => {
    toast.success(`Exporting report #${reportId} as ${format}...`);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <Card className="shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Button 
                icon={<ArrowLeftOutlined />}
                onClick={() => setLocation('/dashboard')}
                type="text"
              >
                Back
              </Button>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Reports</h2>
                <div className="flex items-center gap-2 mt-1">
                  <Tag color="blue">Report ID: {reportId}</Tag>
                  <Tag color="green">{currentReport.patient}</Tag>
                </div>
              </div>
            </div>
            <Space size="middle">
              <Button 
                icon={<FileImageOutlined />}
                onClick={() => handleExport('PNG')}
                size="large"
              >
                PNG
              </Button>
              <Button 
                icon={<FilePdfOutlined />}
                type="primary"
                onClick={() => handleExport('PDF')}
                size="large"
              >
                PDF
              </Button>
            </Space>
          </div>

          <Divider />

          {/* PID Section */}
          <div className="mb-4">
            <div className="bg-purple-100 border border-purple-300 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-purple-800">PID</h3>
              <p className="text-gray-700 mt-2">Patient: <strong>{currentReport.patient}</strong></p>
              <p className="text-gray-700">Patient ID: <strong>{currentReport.pid}</strong></p>
            </div>
          </div>

          {/* OBR Section */}
          <div className="mb-4">
            <div className="bg-purple-100 border border-purple-300 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-purple-800">OBR</h3>
              <p className="text-gray-700 mt-2">Test Type: <strong>{currentReport.obr}</strong></p>
            </div>
          </div>

          {/* OBX RESULTS Section */}
          <div>
            <div className="bg-purple-200 border border-purple-400 rounded-lg p-8 min-h-[300px]">
              <h3 className="text-xl font-bold text-purple-900 mb-4">OBX RESULTS</h3>
              <div className="space-y-3">
                {currentReport.results.map((result: string, index: number) => (
                  <div key={index} className="bg-white rounded p-3 shadow-sm">
                    <p className="font-medium text-gray-800">{result}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
