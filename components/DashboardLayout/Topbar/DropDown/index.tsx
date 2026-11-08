import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { logoutUser } from '@/store/slice/userService/userService';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { stopTokenRefreshTimer } from '@/app/utils/token';
import { removeCookie } from '@/app/utils/cookies';
import { toast } from 'sonner';
import { useInitialRender } from '@/hooks';

const TopBarDropdownMenu = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const logoutAction = () => {
    stopTokenRefreshTimer();
    dispatch(logoutUser());
    removeCookie('ttl');
    router.push('/login');
    toast('Successfully Logout', { closeButton: true, richColors: true });
  };

  const initialRenderComplete = useInitialRender();

  const {
    user: { email, name }
  } = useAppSelector((state) => state.userService);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button type="button" className="min-w-0 flex-1 cursor-pointer text-left">
          <p className="truncate text-sm font-medium text-gray-900">
            {initialRenderComplete ? email || 'ada.okonkwo@demo.example' : ''}
          </p>
          <p className="truncate text-xs text-gray-500">
            {initialRenderComplete ? name || 'Ada Okonkwo' : ''}
          </p>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>My account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer" onClick={logoutAction}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
          <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default TopBarDropdownMenu;
