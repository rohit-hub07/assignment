import "./App.css";
import "primereact/resources/themes/lara-light-cyan/theme.css";
import "primereact/resources/primereact.min.css";
import Data from "./components/Data";

function App() {
  return (
    <>
      <div className="App">
        <h1>Product Data Table</h1>
        <Data />
      </div>
    </>
  );
}

export default App;
