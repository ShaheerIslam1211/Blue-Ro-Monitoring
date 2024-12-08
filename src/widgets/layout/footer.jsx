import { Typography } from "@material-tailwind/react";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="py-2">
      <div className="flex w-full flex-wrap items-center justify-center">
        <Typography variant="small" className="font-normal text-inherit">
          &copy; {year}, created by{" "}
          <a
            href="https://cuthours.com"
            target="_blank"
            className="transition-colors hover:text-blue-500 font-bold"
          >
            cuthours.com
          </a>
        </Typography>
      </div>
    </footer>
  );
}

Footer.displayName = "/src/widgets/layout/footer.jsx";

export default Footer;
