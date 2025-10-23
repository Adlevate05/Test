export default function AfterBillingPage() {
  return (
    <div style={{ padding: "2rem" }}>
      <h2>🎉 Billing Complete</h2>
      <p>Your subscription is now active. You can continue using the app.</p>
      <a href="/manage-account">
        <button>View My Subscription</button>
      </a>
    </div>
  );
}
