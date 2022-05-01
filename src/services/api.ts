import axios from "axios";

const baseAPI = axios.create({
  baseURL: "http://localhost:5000/",
});

interface UserData {
  email: string;
  password: string;
}

interface configParams {
  token: string;
  params?: {
    groupBy: string;
    disciplineName?: string;
    teacherName?: string;
  };
}

function getConfig({ token, params }: configParams) {
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    params,
  };
}

async function signUp(signUpData: UserData) {
  await baseAPI.post("/sign-up", signUpData);
}

async function signIn(signInData: UserData) {
  return baseAPI.post<{ token: string }>("/sign-in", signInData);
}

export interface Term {
  id: number;
  number: number;
}

export interface Discipline {
  id: number;
  name: string;
  teacherDisciplines: TeacherDisciplines[];
  term: Term;
}

export interface TeacherDisciplines {
  id: number;
  discipline: Discipline;
  teacher: Teacher;
  tests: Test[];
}

export interface Teacher {
  id: number;
  name: string;
}

export interface Category {
  id: number;
  name: string;
}

export interface Test {
  id?: number;
  name: string;
  pdfUrl: string;
  categoryId: number;
  category: Category;
  views: number;
}

export type TestByDiscipline = Term & {
  disciplines: Discipline[];
};

export type TestByTeacher = TeacherDisciplines & {
  teacher: Teacher;
  disciplines: Discipline[];
  tests: Test[];
};

interface getParams {
  token: string;
  disciplineName?: string;
  teacherName?: string;
}

async function getTestsByDiscipline({ token, disciplineName }: getParams) {
  const params = {
    groupBy: "disciplines",
    disciplineName,
  };

  const config = getConfig({ token, params });
  return baseAPI.get<{ tests: TestByDiscipline[] }>("/tests", config);
}

async function getTestsByTeacher({ token, teacherName }: getParams) {
  const params = {
    groupBy: "teachers",
    teacherName,
  };

  const config = getConfig({ token, params });
  return baseAPI.get<{ tests: TestByTeacher[] }>("/tests", config);
}

async function getCategories({ token }: getParams) {
  const config = getConfig({ token });
  return baseAPI.get<{ categories: Category[] }>("/categories", config);
}

type updateParams = Pick<getParams, "token"> & { testId: number };

async function updateTestViews({ token, testId }: updateParams) {
  const config = getConfig({ token });
  return baseAPI.patch(`/tests/${testId}/views`, {}, config);
}

const api = {
  signUp,
  signIn,
  getTestsByDiscipline,
  getTestsByTeacher,
  getCategories,
  updateTestViews,
};

export default api;
