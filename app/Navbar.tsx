"use client";

import { useEffect, useState } from "react";
import Buttons from "./components/Button";
import { LayoutDashboard, Menu, X } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button, buttonVariants } from "@/components/ui/button";
import Image from "next/image";
import { auth } from "@/auth";
import { signOut } from "./actions/auth-actions";
import Link from "next/link";
import { usePathname } from "next/navigation";
import BrandWordmark from "./components/BrandWordmark";

const navlinks = [
  { name: "About", href: "#about" },
  { name: "Services", href: "#services" },
  { name: "Experience", href: "#experience" },
  { name: "Testimonial", href: "#testimonial" },
  { name: "Contact", href: "#contact" },
];

type Session = typeof auth.$Infer.Session;

function Navbar({ session }: { session: Session | null }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const pathname = usePathname();

  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  return (
    pathname === "/" && (
      <header
        className={`fixed top-0 right-0 left-0 border-transparent transition-all duration-500 ${isScrolled ? "glass-strong py-3" : "bg-transparent py-5"} z-50`}
      >
        <nav className="container mx-auto flex items-center justify-between px-6">
          <Link
            href="/"
            aria-label="K-Dent home"
            className="transition-opacity hover:opacity-80"
          >
            <BrandWordmark />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden items-center gap-1 md:flex">
            <div className="glass flex items-center gap-1 rounded-full px-4 py-1">
              {navlinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="text-muted-foreground hover:text-foreground hover:bg-surface rounded-full px-4 py-2 text-sm"
                >
                  {link.name}
                </a>
              ))}
            </div>
          </div>
          {/* CTA button */}
          <div className="flex items-center gap-3">
            {!session && (
              <div className="hidden md:block">
                <div className="flex items-center gap-2">
                  <Link
                    className={buttonVariants({
                      size: "sm",
                      variant: "outline",
                    })}
                    href="/book-appointment"
                  >
                    Book an appointment
                  </Link>
                  <Buttons size="sm" onClick={() => router.push("/login")}>
                    Login
                  </Buttons>
                </div>
              </div>
            )}
            {session && (
              <div className="hidden md:block">
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={<Button className="bg-none" variant="link" />}
                  >
                    <Image
                      src={session.user.image || `/user.jpg`}
                      alt="user"
                      width={45}
                      height={45}
                      className="borde rounded-full border-2 border-amber-500 object-cover"
                    />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="">
                    <DropdownMenuGroup className="my-5">
                      <DropdownMenuLabel>My Account</DropdownMenuLabel>
                      <DropdownMenuItem>
                        {" "}
                        <Link href="/dashboard">Dashboard</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Link href="/book-appointment">
                          Book an appointment
                        </Link>
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                      <DropdownMenuItem>
                        <button onClick={handleSignOut}>Sign Out</button>
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>

          {/* Mobile menu control */}
          <div className="flex items-center gap-1 md:hidden">
            <button
              aria-controls="mobile-navigation"
              aria-expanded={isMobileMenuOpen}
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
              className="text-foreground cursor-pointer p-2"
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              type="button"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </nav>
        {/* Mobile menu */}

        {isMobileMenuOpen && (
          <div
            className="glass-strong animate-fade-in absolute inset-x-0 top-full z-50 border-t border-white/10 md:hidden"
            id="mobile-navigation"
          >
            <div className="container mx-auto flex flex-col gap-4 px-6 py-6">
              {navlinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-muted-foreground hover:text-foreground py-2 text-lg"
                >
                  {link.name}
                </a>
              ))}

              <Link
                className={`${buttonVariants({ size: "sm", variant: "outline" })} justify-center gap-2`}
                href="/dashboard"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <LayoutDashboard aria-hidden="true" size={16} />
                Dashboard
              </Link>

              {session ? (
                <>
                  <Link
                    className={buttonVariants({
                      size: "sm",
                      variant: "outline",
                    })}
                    href="/book-appointment"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Book an appointment
                  </Link>
                  <Button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      void handleSignOut();
                    }}
                    size="sm"
                  >
                    Log Out!
                  </Button>
                </>
              ) : (
                <>
                  <Link
                    className={buttonVariants({
                      size: "sm",
                      variant: "outline",
                    })}
                    href="/book-appointment"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Book an appointment
                  </Link>
                  <Button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      router.push("/login");
                    }}
                    size="sm"
                  >
                    Log In!
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </header>
    )
  );
}

export default Navbar;
