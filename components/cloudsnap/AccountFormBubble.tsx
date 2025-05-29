
import { useState } from 'react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';

interface AccountFormBubbleProps {
  type: 'create' | 'login';
  onSubmit: (email: string, password: string) => void;
}

const AccountFormBubble = ({ type, onSubmit }: AccountFormBubbleProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(email, password);
  };

  return (
    <div className="bg-white p-4 rounded-2xl rounded-tl-md shadow-sm border border-separator max-w-[80%] animate-bubble-enter">
      <h3 className="font-medium mb-3 font-rubik">
        {type === 'create' ? 'Create Account' : 'Log In'}
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="font-rubik border-0 border-b-2 border-separator rounded-none focus:border-accent-primary transition-colors duration-400"
          />
        </div>
        <div>
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="font-rubik border-0 border-b-2 border-separator rounded-none focus:border-accent-primary transition-colors duration-400"
          />
        </div>
        <Button 
          type="submit" 
          className="w-full bg-accent-primary hover:bg-blue-600 font-rubik"
        >
          {type === 'create' ? 'Create Account' : 'Log In'}
        </Button>
      </form>
    </div>
  );
};

export default AccountFormBubble;
