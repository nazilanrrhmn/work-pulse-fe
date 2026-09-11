import { Provider } from "react-redux";
import RouterApp from "./router";
import { store } from "./store";

export default function App() {
  return (
    <Provider store={store}>
      <RouterApp />
    </Provider>
  );
}
