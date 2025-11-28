"use client"; // now it's a client module

import { supabase } from "@/lib/supabase";

interface Student {
  id?: string;
  full_name: string;
  email: string;
  class: string;
  phone: string;
}

export async function getStudents(search?: string, classFilter?: string, sortBy?: string) {
  let query = supabase.from("students").select("*");

  if (search) {
    query = query.ilike("full_name", `%${search}%`);
  }

  if (classFilter) {
    query = query.eq("class", classFilter);
  }

  // Apply sorting
  if (sortBy === "newest") {
    query = query.order("created_at", { ascending: false });
  } else if (sortBy === "oldest") {
    query = query.order("created_at", { ascending: true });
  } else if (sortBy === "name-asc") {
    query = query.order("full_name", { ascending: true });
  } else if (sortBy === "name-desc") {
    query = query.order("full_name", { ascending: false });
  } else {
    query = query.order("created_at", { ascending: false });
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function getStudent(id: string) {
  const { data, error } = await supabase.from("students").select("*").eq("id", id).single();
  if (error) throw error;
  return data;
}

export async function createStudent(student: Student) {
  const { data, error } = await supabase.from("students").insert([student]).select().single();
  if (error) throw error;
  return data;
}

export async function updateStudent(id: string, student: Partial<Student>) {
  const { data, error } = await supabase.from("students").update(student).eq("id", id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteStudent(id: string) {
  const { error } = await supabase.from("students").delete().eq("id", id);
  if (error) throw error;
}

export async function getClasses(): Promise<string[]> {
  type StudentClass = {
    class: string;
  };

  const { data, error } = await supabase
    .from("students")
    .select("class", { count: "exact" });

  if (error) throw error;

  const classes = Array.from(new Set(data?.map((row) => row.class)));
  classes.sort();
  return classes;
}
