import { Button } from "@mui/material";

function App() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      <h1 className="text-4xl font-bold mb-4">
        Tailwind + Vite + MUI is Working! 🚀
      </h1>
      <Button variant="contained" color="primary" className="!bg-blue-500">
        MUI Button
      </Button>
    </div>
  );
}

export default App;
