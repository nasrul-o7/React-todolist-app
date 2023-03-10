import moment from "moment";
import { useState, useEffect } from "react";
import firebase from "../firebase";

export function useTodos() {
  const [todos, setTodos] = useState([]);

  useEffect(() => {
    let unsubscribe = firebase
      .firestore()
      .collection("todos")
      .onSnapshot((snapshot) => {
        const data = snapshot.docs.map((doc) => {
          return {
            id: doc.id,
            ...doc.data(),
          };
        });
        setTodos(data);
      });

    return () => unsubscribe();
  }, []);

  return todos;
}

export function useFilterTodos(todos, selectedProject) {
  const [filteredTodos, setFilteredTodos] = useState([]);

  useEffect(() => {
    let data;
    const todayDateFormatted = moment().format("DD/MM/YYYY");

    if (selectedProject === "today") {
      data = todos.filter((todo) => {
        const todoDate = moment(todo.date, "DD/MM/YYYY");
        const todayDate = moment(todayDateFormatted, "DD/MM/YYYY");

        const diffDays = todoDate.diff(todayDate, "days");

        return diffDays >= 0 && diffDays < 7;
      });
    } else if (selectedProject === "next 7 days") {
      data = todos.filter((todo) => {
        const todoDate = moment(todo.date, "DD/MM/YYYY");
        const todayDate = moment(todayDateFormatted, "DD/MM/YYYY");

        const diffDays = todoDate.diff(todayDate, "days");

        return diffDays >= 0 && diffDays < 1;
      });
    } else if (selectedProject === "all days") {
      data = todos;
    } else {
      data = todos.filter((todo) => todo.projectName === selectedProject);
    }

    setFilteredTodos(data);
  }, [todos, selectedProject]);

  return filteredTodos;
}

export function useProjects(todos) {
  const [projects, setProjects] = useState([]);

  function calculateNumOfTodos(projectName, todos) {
    return todos.filter((todo) => todo.projectName === projectName).length;
  }

  useEffect(() => {
    let unsubscribe = firebase
      .firestore()
      .collection("projects")
      .onSnapshot((snapshot) => {
        const data = snapshot.docs.map((doc) => {
          const projectName = doc.data().name;

          return {
            id: doc.id,
            name: projectName,
            numOfTodos: calculateNumOfTodos(projectName, todos),
          };
        });
        setProjects(data);
      });

    return () => unsubscribe();
  }, []);

  return projects;
}
