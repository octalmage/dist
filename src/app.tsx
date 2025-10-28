import React from "react";
import Footer from "./components/footer/footer.jsx";
import "./app.css";
import { Page } from "./page/page.jsx";
import Headline from "./components/headline/headline.jsx";

export const App = (): React.JSX.Element => {
  return (
    <div className="App sans-serif">
      <div className="flex flex-column min-vh-100">
        <Headline isDownload={false} />
        <main className="flex-auto">
          <Page />
        </main>
        <Footer />
      </div>
    </div>
  )
}
