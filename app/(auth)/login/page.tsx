'use client';

import _ from 'lodash';
import { useEffect, useState } from 'react';
import { ReloadIcon } from '@radix-ui/react-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { addMilliseconds } from 'date-fns';
import { useAppDispatch } from '@/store/hooks';
import { setUser } from '@/store/slice/userService/userService';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { setCookie } from '@/app/utils/cookies';
import { Button } from '@/components/ui/button';
import { loginFormSchema } from './schemas/login.schema';
import { LoginFormData } from './types';
import { useLoginMutation } from './queries';

const ProfileForm = () => {
  const router = useRouter();

  const [show2Fa, setShow2Fa] = useState<boolean>(false);
  const dispatch = useAppDispatch();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: { email: '', password: '' }
  });

  // const { mutate: login, isPending, data } = useLoginMutation();

  // useEffect(() => {
  //   if (data) {
  //     const { token, userId, ttl } = data?.data?.data || {};
  //     dispatch(
  //       setUser({
  //         id: userId,
  //         isAuthenticated: Boolean(token),
  //         token
  //       })
  //     );

  //     const tokenExpiration = addMilliseconds(new Date(), ttl);
  //     setCookie('ttl', tokenExpiration.toISOString(), tokenExpiration);
  //   }
  // }, [router, data, dispatch]);

  const onSubmit = async (data: LoginFormData) => {
    if (!_.isEmpty(form.formState.errors)) {
      return;
    }

    router.push('/dashboard');

    // login(data);
  };

  // const handleLoginSuccess = (has2fa: boolean) => {
  //   if (has2fa) {
  //     router.push('/verify-2fa');
  //   } else {
  //     setShow2Fa(true);
  //   }
  // };

  // const handleForgotPassword = () => {
  //   router.push('/forgot-password');
  // };

  // const isPending = true;

  return (
    <div className="mx-auto flex h-[calc(100vh-69px)] w-full max-w-sm flex-col justify-center overflow-hidden px-6 sm:px-3">
      <div>
        <h2 className="mb-6 text-2xl font-bold">Sign in to your account</h2>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="Your email address" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter Password"
                      type="password"
                      autoComplete="off"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div>
              <Button
                className="w-full mb-3"
                type="submit"
                size="lg"
                // disabled={isPending}
              >
                {/* {isPending && <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />} */}
                Sign in
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default ProfileForm;
