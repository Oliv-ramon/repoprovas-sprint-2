import { createContext } from "react";
import useAuth from "../hooks/useAuth";
import api, { Category, TestByDiscipline, TestByTeacher } from "../services/api";

interface ReloadContext {
  loadPage: ({ 
    setTerms, 
    setCategories,
  }: LoadPageParams) => Promise<void>;
}

export const ReloadContext = createContext<ReloadContext | null>(null);

interface LoadPageParams {
  setTerms?: React.Dispatch<React.SetStateAction<TestByDiscipline[]>>;
  setTeachersDisciplines?: React.Dispatch<React.SetStateAction<TestByTeacher[]>>;
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
}

interface Props {
  children: React.ReactNode;
}

export default function ReloadProvider({ children }: Props) {
  const { token } = useAuth();

  async function loadPage({
    setTerms,
    setTeachersDisciplines,
    setCategories,
  }: LoadPageParams
  ) {
    if (!token) return;

    if (setTerms) {
      const { data: testsData } = await api.getTestsByDiscipline({ token });
      setTerms(testsData.tests);
    } 
    
    if(setTeachersDisciplines) {
      const { data: testsData } = await api.getTestsByTeacher({ token });
      setTeachersDisciplines(testsData.tests);
    }

    const { data: categoriesData } = await api.getCategories({ token });
    setCategories(categoriesData.categories);
  }

  return (
    <ReloadContext.Provider value={{ loadPage }}>
      {children}
    </ReloadContext.Provider>
  );
}
