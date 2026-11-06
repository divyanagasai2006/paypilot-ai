
import { useEffect, useState } from "react";
import PayPalCheckout from "./PayPalCheckout";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const EXISTING_ORDER_ID = "9MH7618615915164F";

const sampleTransactions = [
  {
    name: "Netflix Subscription",
    category: "Entertainment",
    date: "Sample Data",
    amount: "-₹649",
    status: "Sample",
    icon: "N",
    color: "bg-red-100 text-red-600",
  },
  {
    name: "Amazon Purchase",
    category: "Shopping",
    date: "Sample Data",
    amount: "-₹1,299",
    status: "Sample",
    icon: "A",
    color: "bg-orange-100 text-orange-600",
  },
  {
    name: "Salary Credit",
    category: "Income",
    date: "Sample Data",
    amount: "+₹25,000",
    status: "Sample",
    icon: "₹",
    color: "bg-green-100 text-green-600",
  },
];

function App() {
  const [activePage, setActivePage] = useState("Overview");
  const [question, setQuestion] = useState("");
  const [chatMessages, setChatMessages] = useState([
    {
      role: "assistant",
      text: "Hello! I'm PayPilot AI. ✨ Ask me anything about payments, transactions, refunds, or basic financial concepts. How can I help you today?",
    },
  ]);
  const [aiLoading, setAiLoading] = useState(false);

  const [liveTransactions, setLiveTransactions] = useState([]);
  const [historyMessage, setHistoryMessage] = useState(
    "Loading payment history..."
  );

  function addTransaction(transaction) {
    setLiveTransactions((previous) => {
      const alreadyExists = previous.some(
        (item) => item.id === transaction.id
      );

      if (alreadyExists) {
        return previous;
      }

      return [transaction, ...previous];
    });
  }

  useEffect(() => {
    async function loadExistingPayment() {
      try {
        const response = await fetch(
          `http://localhost:8000/api/orders/${EXISTING_ORDER_ID}`
        );

        if (!response.ok) {
          throw new Error("Could not load existing payment.");
        }

        const data = await response.json();
        const purchaseUnit = data.purchase_units?.[0];
        const capture = purchaseUnit?.payments?.captures?.[0];

        if (
          data.status === "COMPLETED" &&
          capture?.status === "COMPLETED"
        ) {
          const transaction = {
            id: capture.id,
            name: "PayPal Sandbox Payment",
            category: "Online Payment",
            date: capture.create_time
              ? new Date(capture.create_time).toLocaleString()
              : "Date unavailable",
            amount: `$${capture.amount?.value || "5.00"} ${
              capture.amount?.currency_code || "USD"
            }`,
            status: capture.status,
            icon: "$",
            color: "bg-blue-100 text-blue-600",
          };

          addTransaction(transaction);
          setHistoryMessage(
            "Completed Sandbox payment loaded successfully."
          );
        } else {
          setHistoryMessage(
            "No completed payment found for this order."
          );
        }
      } catch (error) {
        console.error("Payment history error:", error);
        setHistoryMessage(
          "Unable to load payment history. Check the backend."
        );
      }
    }

    loadExistingPayment();
  }, []);

  async function handleAskAI(event) {
    event.preventDefault();

    const userMessage = question.trim();

    if (!userMessage || aiLoading) {
      return;
    }

    setChatMessages((previous) => [
      ...previous,
      { role: "user", text: userMessage },
    ]);

    setQuestion("");
    setAiLoading(true);

    try {
      const response = await fetch(
        "http://localhost:8000/api/ai/chat",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: userMessage,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Unable to get a response from AI."
        );
      }

      setChatMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          text: data.reply,
        },
      ]);
    } catch (error) {
      console.error("AI Chat Error:", error);

      setChatMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          text: "Sorry, I couldn't connect to PayPilot AI right now. Please check whether the backend server is running and try again.",
        },
      ]);
    } finally {
      setAiLoading(false);
    }
  }

  const displayedTransactions = [
    ...liveTransactions,
    ...sampleTransactions,
  ];

  const menuItems = [
    { name: "Overview", icon: "▦" },
    { name: "Transactions", icon: "↔" },
    { name: "AI Assistant", icon: "✧" },
    { name: "Payment Settings", icon: "⚙" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 md:flex">
      {/* Sidebar */}
      <aside className="w-full bg-slate-950 p-6 text-white md:min-h-screen md:w-64">
        <div className="mb-10 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-2xl font-bold">
            P
          </div>
          <div>
            <h1 className="text-xl font-bold">PayPilot AI</h1>
            <p className="text-xs text-slate-400">
              Smart Payment Assistant
            </p>
          </div>
        </div>

        <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-500">
          Main Menu
        </p>

        <nav className="space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.name}
              onClick={() => setActivePage(item.name)}
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left transition ${
                activePage === item.name
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-950/30"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="font-medium">{item.name}</span>
            </button>
          ))}
        </nav>

        <div className="mt-12 rounded-2xl border border-slate-800 bg-slate-900 p-4">
          <div className="mb-2 text-xl">✧</div>
          <h3 className="font-semibold">AI-powered payments</h3>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            Manage and understand your payments in one place.
          </p>
        </div>

        <div className="mt-8 border-t border-slate-800 pt-5">
          <p className="text-sm text-slate-400">
            Your personal finance space
          </p>
          <p className="mt-1 text-sm font-semibold">
            PayPilot AI v1.0
          </p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="min-w-0 flex-1 p-5 md:p-8">
        {/* Header */}
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-slate-500">Welcome back!</p>
            <h2 className="mt-1 text-2xl font-bold text-slate-900 md:text-3xl">
              {activePage}
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Manage your payments with intelligence.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-500 sm:block">
              ● Sandbox Environment
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700">
              D
            </div>
          </div>
        </header>

        {/* Overview */}
        {activePage === "Overview" && (
          <>
            <section className="mb-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
              {[
                {
                  title: "Total Balance",
                  value: "Not connected",
                  note: "Sandbox account balance",
                  icon: "₹",
                  color: "bg-blue-100 text-blue-700",
                },
                {
                  title: "Total Payments",
                  value: liveTransactions.length,
                  note: "Completed Sandbox payments",
                  icon: "↗",
                  color: "bg-purple-100 text-purple-700",
                },
                {
                  title: "Money Received",
                  value: "Not connected",
                  note: "Receiving history",
                  icon: "↓",
                  color: "bg-green-100 text-green-700",
                },
                {
                  title: "AI Insights",
                  value: "Ready",
                  note: "Gemini AI connected",
                  icon: "✧",
                  color: "bg-orange-100 text-orange-700",
                },
              ].map((stat) => (
                <div
                  key={stat.title}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-slate-500">
                      {stat.title}
                    </p>
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl text-xl font-bold ${stat.color}`}
                    >
                      {stat.icon}
                    </div>
                  </div>

                  <h3 className="mt-5 text-2xl font-bold text-slate-900">
                    {stat.value}
                  </h3>
                  <p className="mt-2 text-xs text-slate-400">
                    {stat.note}
                  </p>
                </div>
              ))}
            </section>

            {/* Welcome Card */}
            <section className="mb-8 overflow-hidden rounded-2xl bg-gradient-to-r from-blue-700 to-indigo-600 p-7 text-white shadow-lg md:p-9">
              <div className="max-w-xl">
                <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-medium">
                  SMART PAYMENT EXPERIENCE
                </span>

                <h3 className="mt-5 text-2xl font-bold md:text-3xl">
                  Payments made smarter with AI.
                </h3>

                <p className="mt-3 text-sm leading-7 text-blue-100">
                  Explore your payment dashboard, track transactions and get
                  assistance through your AI-powered payment assistant.
                </p>

                <button
                  onClick={() => setActivePage("AI Assistant")}
                  className="mt-6 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-blue-700 transition hover:bg-blue-50"
                >
                  Explore AI Assistant →
                </button>
              </div>
            </section>

            {/* Recent Transactions */}
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Recent Transactions
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Live Sandbox payment and sample preview entries
                  </p>
                </div>

                <button
                  onClick={() => setActivePage("Transactions")}
                  className="text-sm font-semibold text-blue-600 hover:text-blue-800"
                >
                  View All →
                </button>
              </div>

              <p className="mb-4 text-xs text-slate-500">
                {historyMessage}
              </p>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[550px] text-left">
                  <thead>
                    <tr className="border-b border-slate-100 text-xs uppercase text-slate-400">
                      <th className="pb-4 font-medium">Transaction</th>
                      <th className="pb-4 font-medium">Date</th>
                      <th className="pb-4 font-medium">Amount</th>
                      <th className="pb-4 font-medium">Status</th>
                    </tr>
                  </thead>

                  <tbody>
                    {displayedTransactions.map((transaction) => (
                      <tr
                        key={transaction.id || transaction.name}
                        className="border-b border-slate-50 last:border-0"
                      >
                        <td className="py-4">
                          <div className="flex items-center gap-3">
                            <div
                              className={`flex h-10 w-10 items-center justify-center rounded-xl font-bold ${transaction.color}`}
                            >
                              {transaction.icon}
                            </div>
                            <div>
                              <p className="text-sm font-semibold">
                                {transaction.name}
                              </p>
                              <p className="text-xs text-slate-400">
                                {transaction.category}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="py-4 text-sm text-slate-500">
                          {transaction.date}
                        </td>

                        <td className="py-4 text-sm font-semibold">
                          {transaction.amount}
                        </td>

                        <td className="py-4">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                              transaction.status === "COMPLETED"
                                ? "bg-green-50 text-green-700"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {transaction.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}

        {/* Transactions Page */}
        {activePage === "Transactions" && (
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-bold">All Transactions</h3>

            <p className="mt-2 text-sm text-slate-500">
              PayPal Sandbox payment history and sample preview entries.
            </p>

            <p className="mt-3 text-xs text-slate-500">
              {historyMessage}
            </p>

            <div className="mt-6 space-y-4">
              {displayedTransactions.map((transaction) => (
                <div
                  key={transaction.id || transaction.name}
                  className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4"
                >
                  <div>
                    <p className="font-semibold">{transaction.name}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {transaction.date}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {transaction.category}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="font-bold">{transaction.amount}</p>
                    <p className="mt-1 text-xs text-green-700">
                      {transaction.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* AI Assistant Page */}
        {activePage === "AI Assistant" && (
          <section className="mx-auto max-w-3xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 p-6 md:p-8">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-3xl text-blue-700">
                  ✧
                </div>
                <div>
                  <h3 className="text-xl font-bold">
                    PayPilot AI Assistant
                  </h3>
                  <p className="mt-1 text-sm text-green-600">
                    ● Gemini AI connected
                  </p>
                </div>
              </div>

              <p className="mt-4 text-sm leading-6 text-slate-500">
                Ask questions about payments, transactions, refunds and
                financial concepts. Your AI assistant is ready to help!
              </p>
            </div>

            {/* Chat Messages */}
            <div className="max-h-[500px] min-h-[300px] space-y-5 overflow-y-auto bg-slate-50 p-5 md:p-6">
              {chatMessages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${
                    message.role === "user"
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                      message.role === "user"
                        ? "rounded-br-sm bg-blue-600 text-white"
                        : "rounded-bl-sm border border-slate-200 bg-white text-slate-700"
                    }`}
                  >
                    <p className="mb-1 text-xs font-semibold opacity-70">
                      {message.role === "user" ? "You" : "PayPilot AI"}
                    </p>

                    {message.role === "assistant" ? (
                      <div className="text-sm leading-6">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            h1: ({ children }) => (
                              <h1 className="mb-2 mt-3 text-lg font-bold">
                                {children}
                              </h1>
                            ),
                            h2: ({ children }) => (
                              <h2 className="mb-2 mt-3 text-base font-bold">
                                {children}
                              </h2>
                            ),
                            h3: ({ children }) => (
                              <h3 className="mb-1 mt-3 font-bold">
                                {children}
                              </h3>
                            ),
                            p: ({ children }) => (
                              <p className="mb-2 last:mb-0">
                                {children}
                              </p>
                            ),
                            ul: ({ children }) => (
                              <ul className="mb-2 list-disc space-y-1 pl-5">
                                {children}
                              </ul>
                            ),
                            ol: ({ children }) => (
                              <ol className="mb-2 list-decimal space-y-1 pl-5">
                                {children}
                              </ol>
                            ),
                            strong: ({ children }) => (
                              <strong className="font-bold">
                                {children}
                              </strong>
                            ),
                            hr: () => (
                              <hr className="my-3 border-slate-200" />
                            ),
                          }}
                        >
                          {message.text.replace(/\\([*_#`~])/g, "$1")}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      <p className="whitespace-pre-wrap text-sm leading-6">
                        {message.text}
                      </p>
                    )}
                  </div>
                </div>
              ))}

              {aiLoading && (
                <div className="flex justify-start">
                  <div className="rounded-2xl rounded-bl-sm border border-slate-200 bg-white px-4 py-3">
                    <p className="text-sm text-slate-500">
                      PayPilot AI is thinking...
                    </p>
                    <div className="mt-2 flex gap-1">
                      <span className="h-2 w-2 animate-bounce rounded-full bg-blue-500"></span>
                      <span className="h-2 w-2 animate-bounce rounded-full bg-blue-500 [animation-delay:150ms]"></span>
                      <span className="h-2 w-2 animate-bounce rounded-full bg-blue-500 [animation-delay:300ms]"></span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Chat Input */}
            <div className="border-t border-slate-100 bg-white p-5 md:p-6">
              <form
                onSubmit={handleAskAI}
                className="flex flex-col gap-3 sm:flex-row"
              >
                <input
                  value={question}
                  onChange={(event) => setQuestion(event.target.value)}
                  placeholder="Ask your payment question..."
                  disabled={aiLoading}
                  className="min-w-0 flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                />

                <button
                  type="submit"
                  disabled={aiLoading || !question.trim()}
                  className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-400"
                >
                  {aiLoading ? "Thinking..." : "Send →"}
                </button>
              </form>

              <p className="mt-3 text-center text-xs text-slate-400">
                Powered by Gemini AI · PayPilot AI
              </p>
            </div>
          </section>
        )}

        {/* Payment Settings */}
        {activePage === "Payment Settings" && (
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-bold">Payment Settings</h3>

            <p className="mt-2 text-sm text-slate-500">
              Manage your PayPal Sandbox payment integration.
            </p>

            <div className="mt-6 rounded-xl bg-blue-50 p-5">
              <p className="font-semibold text-blue-900">
                PayPal Environment
              </p>
              <p className="mt-2 text-sm text-blue-700">
                Sandbox mode — payment testing environment.
              </p>
            </div>

            <PayPalCheckout onPaymentSuccess={addTransaction} />
          </section>
        )}

        <footer className="mt-8 text-center text-xs text-slate-400">
          © 2026 PayPilot AI. Smart payments, simplified.
        </footer>
      </main>
    </div>
  );
}

export default App;
