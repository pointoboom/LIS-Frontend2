import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) return;
    onFinish({ username, password });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-4">
      <Card className="w-full max-w-md shadow-2xl border-0">
        <CardContent className="p-6">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Login Page</h1>
            <p className="text-gray-600">Sign in to access your dashboard</p>
          </div>
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Username</label>
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Password</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
              />
            </div>
            <Button type="submit" className="w-full h-12 text-lg font-semibold" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
