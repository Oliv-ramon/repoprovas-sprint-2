import { Box, Button, Divider, MenuItem, TextField, Typography } from "@mui/material";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useAlert from "../hooks/useAlert";
import useAuth from "../hooks/useAuth";
import useReload from "../hooks/useReload";
import api, { Category, CreateTestData, Discipline, TeacherDisciplines, TestByTeacher } from "../services/api";

export default function AddTest() {
  const navigate = useNavigate();
  const { token } = useAuth() as { token: string };
  const { setMessage } = useAlert();
  const [teachersDisciplines, setTeachersDisciplines] = useState<TestByTeacher[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    pdfUrl: "",
    categoryName: "",
    disciplineName: "",
    teacherName: "",
  });
  const { loadPage } = useReload();
  const [loading, setLoading] = useState(false);

  async function handleChange(e: ChangeEvent<HTMLInputElement>) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setLoading(true);

  const haveEmptyFields = Object
    .values(formData)
    .some(value => value === "");

    if (haveEmptyFields) {
      setLoading(false);
      return setMessage({ 
        type: "error",
        text: "Todos os campos devem ser preenchidos"
      });
    }; 

    const testData = mapNamesToIds(
      formData,
      categories as Category[],
      teachersDisciplines
      ) as CreateTestData["testData"];
    
    try {
      await api.createTest({ token, testData });
      setMessage({
        type: "success",
        text: "Teste criado com sucesso!"
      });
      navigate("/app/disciplinas");
    } catch (error) {
      setMessage({ 
        type: "error",
        text: "Houve um erro enviar, por favor, tente novamente" 
      });
    }
 ;   setLoading(false);
  }

  useEffect(() => {
    loadPage({ setTeachersDisciplines, setCategories });
  }, []);

  return (
    <>
      <Typography 
        sx={{
          alignSelf: "center",
          marginY: "28.5px",
          fontWeight: "400",
          fontSize: "22px",
          lineHeight: "24px"
        }}
      >
        Adicione uma prova
      </Typography>
      <Divider sx={{ marginBottom: "35px" }} />
      <Box
        sx={{
          marginX: "auto",
          width: "700px",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <Button
            variant="outlined"
            onClick={() => navigate("/app/disciplinas")}
          >
            Disciplinas
          </Button>
          <Button
            variant="outlined"
            onClick={() => navigate("/app/pessoas-instrutoras")}
          >
            Pessoa Instrutora
          </Button>
          <Button variant="contained" onClick={() => navigate("/app/adicionar")}>
            Adicionar
          </Button>
        </Box>
        <Box 
          component="form"
          sx={{
            display: "flex",
            flexDirection: "column",
            mt: "50px",
          }}
          onSubmit={handleSubmit}
        >
          <TextField
            sx={{ marginBottom: "25px", width: "100%" }}
            label="Titulo da prova"
            name="name"
            value={formData.name}
            onChange={handleChange}
          />
          <TextField
            sx={{ marginBottom: "25px", width: "100%" }}
            label="PDF da prova"
            name="pdfUrl"
            value={formData.pdfUrl}
            onChange={handleChange}
          />
          <TextField
            sx={{ marginBottom: "25px", width: "100%" }}
            label="Categoria"
            name="categoryName"
            value={formData.categoryName}
            select
            onChange={handleChange}
          >
            {categories
              .map(category => (
                <MenuItem 
                  key={category.id} 
                  value={category.name}
                >
                  {category.name}
                </MenuItem>
              ))
            }
          </TextField>
          <TextField
            sx={{ marginBottom: "25px", width: "100%" }}
            label="Disciplina"
            name="disciplineName"
            value={formData.disciplineName}
            select
            onChange={handleChange}
            disabled={formData.categoryName === ""}
          >
            {notDuplicatedDisciplines(teachersDisciplines)
              .map(({ discipline }) => (
                <MenuItem 
                  key={discipline.id} 
                  value={discipline.name}
                >
                  {discipline.name}
                </MenuItem>
              ))
            }
          </TextField>
          <TextField
            sx={{ marginBottom: "25px", width: "100%" }}
            label="Pessoa Instrutora"
            name="teacherName"
            value={formData.teacherName}
            onChange={handleChange}
            select
            disabled={formData.disciplineName === ""}
          >
            {teachersDisciplines
              .filter(teacherOfThisDiscipline(formData.disciplineName))
              .map(({ teacher }) => (
                <MenuItem 
                  key={teacher.id} 
                  value={teacher.name}
                >
                  {teacher.name}
                </MenuItem>
              ))
            }
          </TextField>
          <Button 
            variant="contained"
            type="submit"
            sx={{ marginBottom: "25px" }}
            disabled={loading}
          >
            Enviar
          </Button>
        </Box>
      </Box>
    </>
  );
}

function notDuplicatedDisciplines(teacherDisciplines: TeacherDisciplines[]) {
  const hashtable = {} as any;

  teacherDisciplines.forEach(({discipline}) => {
    if (!hashtable[discipline.name]) {
      hashtable[discipline.name] = true
    } 
  })
  
  return teacherDisciplines.filter(({discipline}) => {
    if (hashtable[discipline.name]) {
      hashtable[discipline.name] = false;
      return true;
    };
  }); 
}

function teacherOfThisDiscipline(disciplineName: Discipline["name"]) {
  return (teacherDiscipline: TeacherDisciplines) => 
    teacherDiscipline.discipline.name === disciplineName;
}

interface FormData {
  name: string;
  pdfUrl: string;
  categoryName: string;
  disciplineName: string;
  teacherName: string;
};

function mapNamesToIds(
  formData: FormData,
  categories: Category[],
  teacherDisciplines: TeacherDisciplines[]
) {
  if (categories.length === 0) return;

  const { id: categoryId } = categories
    .find(category => 
      category.name === formData.categoryName
    ) as Category;
  
  const { discipline: { id: disciplineId } } = teacherDisciplines.
    find(({discipline}) => 
      discipline.name === formData.disciplineName  
    ) as TeacherDisciplines;

  const { teacher: { id: teacherId } } = teacherDisciplines
    .find(({teacher}) => 
      teacher.name === formData.teacherName
    ) as TeacherDisciplines;

  return {
    name: formData.name,
    pdfUrl: formData.pdfUrl,
    categoryId,
    disciplineId,
    teacherId,
  }
}