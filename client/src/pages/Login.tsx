import { Button, Form, Input, Card } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useLocation } from 'wouter';
import { useState } from 'react';

export default function Login() {
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: any) => {
    setLoading(true);
    // Simulate login
    setTimeout(() => {
      console.log('Login values:', values);
      localStorage.setItem('isAuthenticated', 'true');
      setLocation('/dashboard');
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <Card className="w-full max-w-md shadow-2xl border-0">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Login Page</h1>
          <p className="text-gray-600">Sign in to access your dashboard</p>
        </div>
        
        <Form
          name="login"
          onFinish={onFinish}
          autoComplete="off"
          layout="vertical"
          size="large"
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: 'Please input your username!' }]}
          >
            <Input 
              prefix={<UserOutlined className="text-gray-400" />} 
              placeholder="Username" 
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Please input your password!' }]}
          >
            <Input.Password
              prefix={<LockOutlined className="text-gray-400" />}
              placeholder="Password"
            />
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              className="w-full h-12 text-lg font-semibold"
              loading={loading}
            >
              Sign in
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
