(() => {
  const STORAGE_KEY = "douglas-jelinsky-cv";
  const resume = document.querySelector("#resume");
  const editableNodes = () => [...document.querySelectorAll("[data-editable]")];
  const editButton = document.querySelector("#editButton");
  const printButton = document.querySelector("#printButton");
  const restoreButton = document.querySelector("#restoreButton");
  const editState = document.querySelector("#editState");
  const toast = document.querySelector("#toast");
  let isEditing = false;
  let toastTimer;
  const originalMarkup = resume.innerHTML;

  const showToast = (message) => {
    toast.textContent = message;
    toast.classList.add("is-visible");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove("is-visible"), 2600);
  };

  const updateSkillBars = () => {
    document.querySelectorAll(".skill").forEach((skill) => {
      const percentageNode = skill.querySelector(".skill__meta span:last-child");
      const bar = skill.querySelector(".skill__track span");
      if (!percentageNode || !bar) return;
      const numericValue = Math.max(0, Math.min(100, Number.parseInt(percentageNode.textContent, 10) || 0));
      bar.style.setProperty("--level", `${numericValue}%`);
    });
  };

  const setEditing = (nextState) => {
    isEditing = nextState;
    resume.classList.toggle("is-editing", isEditing);
    editableNodes().forEach((node) => {
      node.contentEditable = String(isEditing);
      node.spellcheck = false;
    });
    editButton.textContent = isEditing ? "Concluir edição" : "Editar currículo";
    restoreButton.hidden = !isEditing;
    editState.textContent = isEditing ? "Edição liberada · clique nos textos" : "Visualização protegida";
    if (isEditing) {
      showToast("Você pode clicar em qualquer texto azul para editar.");
    }
  };

  const save = (notify = true) => {
    try {
      localStorage.setItem(STORAGE_KEY, resume.innerHTML);
      updateSkillBars();
      if (notify) showToast("Alterações salvas neste navegador.");
    } catch (error) {
      showToast("Não foi possível salvar neste navegador.");
    }
  };

  const restore = () => {
    const confirmed = window.confirm("Restaurar o conteúdo original do currículo? As alterações salvas neste navegador serão apagadas.");
    if (!confirmed) return;
    resume.innerHTML = originalMarkup;
    localStorage.removeItem(STORAGE_KEY);
    updateSkillBars();
    setEditing(true);
    showToast("Conteúdo original restaurado.");
  };

  const load = () => {
    try {
      const savedMarkup = localStorage.getItem(STORAGE_KEY);
      if (savedMarkup) {
        resume.innerHTML = savedMarkup;
        showToast("Suas últimas alterações foram carregadas.");
      }
    } catch (error) {
      // A página continua utilizável mesmo se o armazenamento estiver bloqueado.
    }
    updateSkillBars();
    setEditing(false);
  };

  let saveTimer;
  resume.addEventListener("input", () => {
    updateSkillBars();
    window.clearTimeout(saveTimer);
    saveTimer = window.setTimeout(() => save(false), 450);
  });

  editButton.addEventListener("click", () => {
    if (isEditing) {
      save();
      setEditing(false);
    } else {
      setEditing(true);
    }
  });
  restoreButton.addEventListener("click", restore);
  printButton.addEventListener("click", () => {
    if (isEditing) {
      save(false);
      setEditing(false);
    }
    window.setTimeout(() => window.print(), 80);
  });

  load();
})();
