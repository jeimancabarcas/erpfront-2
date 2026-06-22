export interface MenuGroup {
  label: string;
  items: MenuItemDef[];
}

export interface MenuItemDef {
  icon: string;
  label: string;
  count?: number;
  routerLink: string;
  disabled?: boolean;
}

export interface UserInfo {
  name: string;
  email: string;
  avatarUrl?: string;
}

export interface CardItem {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl?: string;
  link?: string;
}
