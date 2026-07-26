import { RouterProvider } from 'react-router-dom';
import { router } from './app/router';
import { AuthProvider } from './entities/session';

function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}

export default App;
