type Props = {
  productName?: string;
};

export function SiteFooter({ productName }: Props) {
  const year = new Date().getFullYear();
  return (
    <footer>
      {productName ? (
        <p>
          <strong>{productName}</strong> · part of <a href="/">DevSuites</a>
        </p>
      ) : (
        <p>
          <strong>DevSuites</strong> · Four Mac apps. One local developer
          suite.
        </p>
      )}
      <p>
        © {year} DevSuites · <a href="https://devsuites.dev">devsuites.dev</a>
        {productName ? null : " · Payments via Lemon Squeezy."}
      </p>
    </footer>
  );
}
