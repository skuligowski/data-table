import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';
import './App.css';
import GridExample from './GridExample';
import { ServerSideRowModelModule } from 'ag-grid-enterprise';

ModuleRegistry.registerModules([AllCommunityModule, ServerSideRowModelModule]);

function App() {
  return (
    <div style={{ height: '100vh' }}>
      <GridExample />
    </div>
  );
}

export default App;
