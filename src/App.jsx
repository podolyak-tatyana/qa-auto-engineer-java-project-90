import React from "react";
import TaskManagerApp from "@hexlet/testing-task-manager";

/** Обёртка приложения для точки входа (покрытие src/) */
function App() {
    const AppComponent = TaskManagerApp();
    return <>{AppComponent}</>;
}

export default App;
