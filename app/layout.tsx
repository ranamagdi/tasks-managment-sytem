import Header from "@/components/common/Header/Header";
import "./globals.css";
import ReactQueryProvider from "./providers/ReactQueryProvider";
import ReduxProvider from "./providers/ReduxProvider";
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ReduxProvider>
          <ReactQueryProvider>
            <Header />
            {children}
            <div id="modal-root" />
          </ReactQueryProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
