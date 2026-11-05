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

  const ensureLatestExperience = () => {
    const timeline = resume.querySelector(".timeline");
    if (!timeline || timeline.querySelector('[data-experience="almoxarife"]')) return false;
    const newExperience = `
      <article class="timeline-item" data-experience="almoxarife">
        <div class="timeline-marker"><span></span></div>
        <div class="timeline-date" data-editable>04/02/2019<br />a 12/01/2020</div>
        <div class="timeline-copy"><h3 data-editable>TRATAMENTO E PINTURA</h3><p data-editable>Almoxarife</p></div>
      </article>`;
    const existingItems = timeline.querySelectorAll(".timeline-item");
    (existingItems[2] || existingItems[existingItems.length - 1]).insertAdjacentHTML("afterend", newExperience);
    return true;
  };

  const ensureLatestContact = () => {
    const contactList = resume.querySelector(".contact-list");
    if (!contactList || contactList.querySelector('[data-contact="instagram"]')) return false;
    contactList.insertAdjacentHTML("beforeend", `
      <div class="contact-item" data-contact="instagram"><dt data-editable>INSTAGRAM</dt><dd data-editable>@seuinstagram</dd></div>`);
    return true;
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
    syncRemoveButtons();
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
        const migratedExperience = ensureLatestExperience();
        const migratedContact = ensureLatestContact();
        if (migratedExperience || migratedContact) save(false);
        showToast("Suas últimas alterações foram carregadas.");
      }
    } catch (error) {
      // A página continua utilizável mesmo se o armazenamento estiver bloqueado.
    }
    updateSkillBars();
    setEditing(false);
  };

  const syncRemoveButtons = () => {
    resume.querySelectorAll(".timeline-item, .course-list li, .skill").forEach(item => {
      if (item.querySelector(":scope > .item-remove")) return;
      const btn=document.createElement("button"); btn.type="button";btn.className="item-remove";btn.textContent="Excluir";item.appendChild(btn);
    });
  };
  const addItem = (parent,node,prepend=false) => {
    if (!isEditing) return;
    if(prepend) parent.prepend(node); else parent.appendChild(node);
    node.querySelectorAll("[data-editable]").forEach(el=>{el.contentEditable="true";el.spellcheck=true});
    syncRemoveButtons();save(false);
    (node.querySelector("[data-editable]")||node).focus();
  };
  resume.addEventListener("click",event=>{
    const btn=event.target.closest(".item-remove");if(!btn||!isEditing)return;
    const item=btn.closest(".timeline-item, .course-list li, .skill");
    if(item&&window.confirm("Excluir este item?")){item.remove();save(false);showToast("Item excluído.");}
  });
  document.querySelector("#addExperienceButton").addEventListener("click",()=>{
    const node=document.createElement("article");node.className="timeline-item";
    node.innerHTML='<div class="timeline-marker"><span></span></div><div class="timeline-date" data-editable>Período</div><div class="timeline-copy"><h3 data-editable>Nova empresa</h3><p data-editable>Cargo ou atividade</p></div>';
    addItem(resume.querySelector(".timeline"),node,true);
  });
  document.querySelector("#addCourseButton").addEventListener("click",()=>{
    const node=document.createElement("li");node.setAttribute("data-editable","");node.textContent="Novo curso";addItem(resume.querySelector(".course-list"),node);
  });
  document.querySelector("#addSkillButton").addEventListener("click",()=>{
    const node=document.createElement("div");node.className="skill";node.innerHTML='<div class="skill__meta"><span data-editable>NOVA HABILIDADE</span><span data-editable>70%</span></div><div class="skill__track"><span style="--level:70%"></span></div>';
    addItem(resume.querySelector(".skills-list"),node);
  });
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
