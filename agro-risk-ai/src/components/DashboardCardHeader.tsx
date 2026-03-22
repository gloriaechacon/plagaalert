import logo from "../assets/plagaalert_logo.png";

type DashboardCardHeaderProps = {
  title: string;
  subtitle: string;
};

export default function DashboardCardHeader({ title, subtitle }: DashboardCardHeaderProps) {
  return (
    <div className="header">
      <div className="logo">
        <img src={logo} alt="PlagaAlert" width={120} height={120} />
      </div>
      <div className="title-block">
        <h1 className="title">{title}</h1>
        <p className="subtitle">{subtitle}</p>
      </div>
    </div>
  );
}
