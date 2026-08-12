import { Link, usePage } from '@inertiajs/react';
import { Images, LayoutGrid, Package, Store, Tags } from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import { dashboard as adminDashboard } from '@/routes/admin';
import adminCategories from '@/routes/admin/categories';
import adminMedia from '@/routes/admin/media';
import adminProducts from '@/routes/admin/products';
import type { Auth, NavItem } from '@/types';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
];

const adminNavItems: NavItem[] = [
    {
        title: 'Store admin',
        href: adminDashboard(),
        icon: Store,
    },
    {
        title: 'Products',
        href: adminProducts.index(),
        icon: Package,
    },
    {
        title: 'Categories',
        href: adminCategories.index(),
        icon: Tags,
    },
    {
        title: 'Media',
        href: adminMedia.index(),
        icon: Images,
    },
];

export function AppSidebar() {
    const { auth } = usePage<{ auth: Auth }>().props;

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain
                    items={
                        auth.user?.is_admin
                            ? [...mainNavItems, ...adminNavItems]
                            : mainNavItems
                    }
                />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
