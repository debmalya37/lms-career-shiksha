"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast"
import { redirect, useRouter } from "next/navigation";
import axios, { AxiosError } from "axios";
import { ApiResponse } from "@src/types/ApiResponse";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Loader2Icon } from "lucide-react";
import { signIn, useSession } from "next-auth/react";
function Page() {
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      identifier: '',
      password: '',
    },
  });




  const onSubmit = async (data: z.infer<typeof signInSchema>) => {
    const result = await signIn("credentials", {
        redirect: false,
        identifier: data.identifier,
        password: data.identifier
    });
    if (result?.error) {
        if(result.error === 'CredentialsSignin') {
            toast({
                title: "Login Failed",
                description: "incorrect email or password",
                variant: "destructive"
            })
        } else {
        toast({
            title: "Login Failed",
            description: result.error,
            variant: "destructive"
        })
    } 
}


    if(result?.url) {
        router.replace('/');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen py-2 bg-gradient-to-r from-indigo-200 via-purple-300 to-pink-400">
      <div className="w-full max-w-md p-8 space-y-8 bg-gradient-to-r from-pink-100 via-blue-100 to-pink-200 rounded-lg shadow-2xl">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
            Welcome to Civil Academy
          </h1>
          <p className="mb-4">Sign up to start your Learning Journey</p>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              name="identifier"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="Email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              name="password"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit">
              SignIn
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}

export default Page;
