import { useState } from "react";
import Head from "next/head";
import WidgetList from "../components/WidgetList";
import AddWidgetForm from "../components/AddWidgetForm";

export default function Home() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleWidgetAdded = () => {
    setRefreshTrigger((prev) => prev + 1);
  };
  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Weather Widgets Dashboard</title>
        <meta
          name="description"
          content="Manage weather widgets for different cities"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Weather Widgets Dashboard
            </h1>
            <p className="text-gray-600 text-lg">
              Add and manage weather widgets for your favorite cities
            </p>
          </div>

          {/* Add Widget Form */}
          <div className="mb-8">
            <AddWidgetForm onWidgetAdded={handleWidgetAdded} />
          </div>

          {/* Widgets List */}
          <div>
            <WidgetList key={refreshTrigger} />
          </div>
        </div>
      </main>
    </div>
  );
}
