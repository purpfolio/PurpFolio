/* =========================================
   SUPABASE CONNECTION
========================================= */

const db = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);

/* =========================================
   GLOBAL VARIABLES
========================================= */

let selectedTemplate = "simple";

let currentPortfolio = null;


/* =========================================
   SHORTCUT
========================================= */

const $ = id => document.getElementById(id);

/* =========================================
   FULL NAME VALIDATION
========================================= */

const fullNameInput = $("fullName");
const fullNameError = $("fullNameError");

function validateFullName() {

    const value = fullNameInput.value.trim();

    // Letters, spaces, apostrophes, and hyphens only
    const namePattern = /^[\p{L}]+(?:[\s'-][\p{L}]+)*$/u;

    if (value === "") {
        fullNameInput.classList.remove("valid");
        fullNameInput.classList.remove("invalid");
        fullNameError.hidden = true;

        return false;
    }

    if (!namePattern.test(value)) {

        fullNameInput.classList.remove("valid");
        fullNameInput.classList.add("invalid");

        fullNameError.hidden = false;

        return false;
    }

    fullNameInput.classList.remove("invalid");
    fullNameInput.classList.add("valid");

    fullNameError.hidden = true;

    return true;
}

fullNameInput.addEventListener("input", validateFullName);

fullNameInput.addEventListener("blur", validateFullName);

/* =========================================
   FORM FIELDS
========================================= */

const fields = [

    "fullName",

    "profilePicture",

    "email",

    "contactNumber",

    "address",

    "aboutMe",

    "education",

    "skills",

    "projects",

    "experience",

    "socialLink",

    "websiteLink"

];


/* =========================================
   AUTHENTICATION
========================================= */

const authScreen = $("authScreen");
const appContent = $("appContent");

const loginPanel = $("loginPanel");
const signupPanel = $("signupPanel");

const loginForm = $("loginForm");
const signupForm = $("signupForm");

const loginMessage = $("loginMessage");
const signupMessage = $("signupMessage");

const showSignupBtn = $("showSignupBtn");
const showLoginBtn = $("showLoginBtn");

/* =========================================
   LOGOUT
========================================= */

const logoutBtn = $("logoutBtn");

logoutBtn.addEventListener("click", async () => {

    const { error } = await db.auth.signOut();

    if (error) {
        console.error("Logout error:", error);
        notify("Logout failed: " + error.message);
        return;
    }

    showAuth();
});

/* =========================================
   SHOW LOGIN
========================================= */

function showLogin() {
    loginPanel.style.display = "block";
    signupPanel.style.display = "none";

    loginMessage.textContent = "";
    signupMessage.textContent = "";
}


/* =========================================
   SHOW SIGN UP
========================================= */

function showSignup() {
    loginPanel.style.display = "none";
    signupPanel.style.display = "block";

    loginMessage.textContent = "";
    signupMessage.textContent = "";
}

/* =========================================
   PAGE NAVIGATION
========================================= */

function showPage(pageId) {
    document.querySelectorAll(".page").forEach(page => {
        page.style.display = "none";
    });

    const page = $(pageId);

    if (page) {
        page.style.display = "";
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    }
}
function showApp() {
    authScreen.style.display = "none";

    appContent.style.display = "block";

    const topbar = document.querySelector(".topbar");
    const footer = document.querySelector("footer");

    if (topbar) {
        topbar.style.display = "";
    }

    if (footer) {
        footer.style.display = "";
    }

    // Keep the user on the current page.
    // Only show Home when no page is currently visible.
    const visiblePage = [...document.querySelectorAll(".page")]
        .find(page => getComputedStyle(page).display !== "none");

    if (!visiblePage) {
        showPage("home");
    }

    loadPortfolios();
}


/* =========================================
   SHOW AUTH SCREEN
========================================= */

function showAuth() {
    authScreen.style.display = "flex";

    appContent.style.display = "none";

    const topbar = document.querySelector(".topbar");
    const footer = document.querySelector("footer");

    if (topbar) {
        topbar.style.display = "none";
    }

    if (footer) {
        footer.style.display = "none";
    }

    showLogin();
}


/* =========================================
   SIGN UP
========================================= */

signupForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    const email = $("signupEmail").value.trim();
    const password = $("signupPassword").value;
    const confirmPassword = $("signupConfirmPassword").value;

    signupMessage.textContent = "";

    if (password !== confirmPassword) {
        signupMessage.textContent = "Passwords do not match.";
        return;
    }

    signupMessage.textContent = "Creating your account...";

    const { data, error } = await db.auth.signUp({
        email: email,
        password: password,
        options: {
            emailRedirectTo:
                "https://purpfolio.github.io/PurpFolio/"
        }
    });

    if (error) {
        console.error("Sign up error:", error);

        signupMessage.textContent = error.message;
        return;
    }

    console.log("Sign up successful:", data);

    signupMessage.textContent =
    "Account created successfully! You can now log in.";
    signupForm.reset();

});


/* =========================================
   LOGIN
========================================= */

loginForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    const email = $("loginEmail").value.trim();
    const password = $("loginPassword").value;

    loginMessage.textContent = "Logging in...";

    const { data, error } = await db.auth.signInWithPassword({
        email: email,
        password: password
    });

    if (error) {
        console.error("Login error:", error);

        loginMessage.textContent = error.message;
        return;
    }

    console.log("Login successful:", data);

loginMessage.textContent = "";

showApp();

});

/* =========================================
   LOGIN / SIGN UP SWITCH
========================================= */

showSignupBtn.addEventListener("click", showSignup);

showLoginBtn.addEventListener("click", showLogin);


/* =========================================
   CHECK EXISTING SESSION
========================================= */

async function checkAuthentication() {
    const {
        data: { session }
    } = await db.auth.getSession();

    if (session) {
        showApp();
    } else {
        showAuth();
    }
}


/* =========================================
   AUTH STATE CHANGES
========================================= */

db.auth.onAuthStateChange((event, session) => {

    console.log("Auth event:", event);

    if (session) {
        showApp();
    } else {
        showAuth();
    }

});


/* =========================================
   START AUTHENTICATION CHECK
========================================= */

checkAuthentication();


/* =========================================
   CHECK SUPABASE CONFIGURATION
========================================= */

function isSupabaseConfigured() {

    return (
        !SUPABASE_URL.includes("PASTE_") &&
        !SUPABASE_ANON_KEY.includes("PASTE_")
    );
}


/* =========================================
   GET FORM DATA
========================================= */


async function formData() {
    const data = {};

    const {
        data: { user },
        error: userError
    } = await db.auth.getUser();

    if (userError || !user) {
        throw new Error("You must be logged in.");
    }

    data.user_id = user.id;

    fields.forEach(id => {
        if (id !== "profilePicture") {
            data[id] = $(id).value.trim();
        }
    });

    const file = $("profilePicture").files[0];

    if (file) {
        const fileName =
            `${Date.now()}-${file.name.replace(/\s+/g, "-")}`;

        const { error: uploadError } =
            await db.storage
                .from("profile-pictures")
                .upload(fileName, file, {
                    cacheControl: "3600",
                    upsert: false
                });

        if (uploadError) {
            console.error(uploadError);
            throw new Error(
                "Profile picture upload failed: " +
                uploadError.message
            );
        }

        const { data: publicUrlData } =
            db.storage
                .from("profile-pictures")
                .getPublicUrl(fileName);

        data.profile_picture =
            publicUrlData.publicUrl;

    } else if (currentPortfolio?.profile_picture) {

        data.profile_picture =
            currentPortfolio.profile_picture;

    } else {

        data.profile_picture = "";

    }

    data.full_name = data.fullName;
delete data.fullName;

return data;
}
/* =========================================
   FILL FORM FOR EDITING
========================================= */


function fillForm(portfolio) {
    $("portfolioId").value = portfolio.id || "";

    fields.forEach(id => {
    if (id === "fullName") {
        $(id).value =
            portfolio.full_name ||
            portfolio.fullName ||
            "";
        } else if (id !== "profilePicture") {
        $(id).value = portfolio[id] || "";
    }
});

}


/* =========================================
   CLEAR FORM
========================================= */

function clearForm() {
    $("portfolioId").value = "";

    fields.forEach(id => {
        const field = $(id);

        field.value = "";
        field.classList.remove("valid", "invalid");
    });

    $("fullNameError").hidden = true;
    $("formMessage").textContent = "";

    currentPortfolio = null;
    selectedTemplate = "simple";
    $("savePortfolioBtn").textContent = "Save Portfolio";

    document.querySelectorAll(".template-card").forEach(card => {
        card.classList.toggle(
            "selected",
            card.dataset.template === "simple"
        );
    });

    notify("Form cleared.");
}




/* =========================================
   TOAST MESSAGE
========================================= */

function notify(message) {

    const toast = $("toast");

    toast.textContent = message;

    toast.classList.add("show");

    setTimeout(() => {

        toast.classList.remove("show");

    }, 2500);
}


/* =========================================
   SECURITY - SAFE URL
========================================= */

function safeUrl(url) {
    if (!url) return "#";

    // Allow images selected from the device
    if (typeof url === "string" && url.startsWith("data:image/")) {
        return url;
    }

    try {
        const u = new URL(url);

        if (u.protocol === "http:" || u.protocol === "https:") {
            return u.href;
        }

        return "#";
    } catch {
        return "#";
    }
}


/* =========================================
   SECURITY - ESCAPE HTML
========================================= */

function esc(value = "") {

    return String(value).replace(
        /[&<>"']/g,

        character => ({

            "&": "&amp;",

            "<": "&lt;",

            ">": "&gt;",

            '"': "&quot;",

            "'": "&#039;"

        })[character]
    );
}


/* =========================================
   CONVERT LINES TO HTML
========================================= */

function lines(text = "") {

    return text
        .split("\n")
        .filter(Boolean)
        .map(line => {

            return `<p>${esc(line)}</p>`;

        })
        .join("");

}


/* =========================================
   CREATE SKILL TAGS
========================================= */

function skills(text = "") {

    return text
        .split(",")
        .map(skill => skill.trim())
        .filter(Boolean)
        .map(skill => {

            return `
                <span class="tag">
                    ${esc(skill)}
                </span>
            `;

        })
        .join("");

}


/* =========================================
   PROFILE PICTURE
========================================= */

function picture(portfolio) {

    if (portfolio.profile_picture) {

        return `
            <img
                src="${esc(
                    safeUrl(
                        portfolio.profile_picture
                    )
                )}"
                alt="${esc(
                    portfolio.full_name
                )} profile picture"
                onerror="
                    this.style.display='none'
                "
            >
        `;

    }


    const initials =
        (portfolio.full_name || "P")
            .split(" ")
            .map(word => word[0])
            .join("")
            .slice(0, 2)
            .toUpperCase();


    return `
        <div class="mini-avatar">
            ${esc(initials)}
        </div>
    `;
}


/* =========================================
   PORTFOLIO GENERATOR
========================================= */

function portfolioMarkup(
    portfolio,
    template
) {

    const social =
        portfolio.socialLink
            ? `
                <a
                    href="${esc(
                        safeUrl(
                            portfolio.socialLink
                        )
                    )}"
                    target="_blank"
                    rel="noopener"
                >
                    Social Media
                </a>
            `
            : "";


    const website =
        portfolio.websiteLink
            ? `
                <a
                    href="${esc(
                        safeUrl(
                            portfolio.websiteLink
                        )
                    )}"
                    target="_blank"
                    rel="noopener"
                >
                    Website / GitHub
                </a>
            `
            : "";


    const contact = [

        portfolio.email,

        portfolio.contactNumber,

        portfolio.address

    ]
        .filter(Boolean)
        .map(esc)
        .join(" · ");


    /* =====================================
       TEMPLATE 1 - SIMPLE
    ===================================== */

    if (template === "simple") {

        return `

            <article
                class="portfolio-render render-simple"
            >

                <div class="render-head">

                    ${picture(portfolio)}

                    <h1>
                        ${esc(
                            portfolio.full_name
                        )}
                    </h1>

                    <p>
                        ${contact}
                    </p>

                </div>


                <section>

                    <h2>
                        About Me
                    </h2>

                    ${lines(
                        portfolio.aboutMe
                    )}

                </section>


                <section>

                    <h2>
                        Education
                    </h2>

                    ${lines(
                        portfolio.education
                    )}

                </section>


                <section>

                    <h2>
                        Skills
                    </h2>

                    <div class="tags">

                        ${skills(
                            portfolio.skills
                        )}

                    </div>

                </section>


                <section>

                    <h2>
                        Projects
                    </h2>

                    ${lines(
                        portfolio.projects
                    )}

                </section>


                <section>

                    <h2>
                        Work Experience
                    </h2>

                    ${lines(
                        portfolio.experience
                    )}

                </section>


                <section
                    class="render-social"
                >

                    ${social}

                    ${website}

                </section>

            </article>
        `;
    }


    /* =====================================
       TEMPLATE 2 - MODERN
    ===================================== */

    if (template === "modern") {

        return `

            <article
                class="portfolio-render render-modern"
            >

                <div class="modern-head">

                    ${picture(portfolio)}

                    <div>

                        <h1>
                            ${esc(
                                portfolio.full_name
                            )}
                        </h1>

                        <p>
                            ${contact}
                        </p>

                    </div>

                </div>


                <div class="modern-content">


                    <div class="modern-box">

                        <h2>
                            About
                        </h2>

                        ${lines(
                            portfolio.aboutMe
                        )}

                    </div>


                    <div class="modern-box">

                        <h2>
                            Skills
                        </h2>

                        <div class="tags">

                            ${skills(
                                portfolio.skills
                            )}

                        </div>

                    </div>


                    <div class="modern-box">

                        <h2>
                            Education
                        </h2>

                        ${lines(
                            portfolio.education
                        )}

                    </div>


                    <div class="modern-box">

                        <h2>
                            Experience
                        </h2>

                        ${lines(
                            portfolio.experience
                        )}

                    </div>


                    <div class="modern-box">

                        <h2>
                            Projects
                        </h2>

                        ${lines(
                            portfolio.projects
                        )}

                    </div>


                    <div
                        class="modern-box render-social"
                    >

                        <h2>
                            Links
                        </h2>

                        ${social}

                        ${website}

                    </div>

                </div>

            </article>

        `;
    }


    /* =====================================
   TEMPLATE 3 - CREATIVE
   PURPLE SPOTLIGHT DESIGN
===================================== */

return `
    <article class="portfolio-render render-creative">

        <!-- CREATIVE HERO -->
        <div class="creative-hero">

            <div class="creative-orb orb-one"></div>
            <div class="creative-orb orb-two"></div>

            <div class="creative-hero-top">
                <span class="creative-label">
                    PORTFOLIO / 03
                </span>

                <span class="creative-label">
                    CREATIVE EDITION
                </span>
            </div>

            <div class="creative-hero-main">

                <div class="creative-photo-wrap">
                    <div class="creative-photo-ring"></div>

                    ${picture(portfolio)}
                </div>

                <div class="creative-intro">

                    <span class="creative-kicker">
                        HELLO, I'M
                    </span>

                    <h1>
                        ${esc(
                            portfolio.full_name
                        )}
                    </h1>

                    <p class="creative-contact">
                        ${contact}
                    </p>

                    <div class="creative-intro-line"></div>

                    <p class="creative-tagline">
                        Turning ideas into meaningful
                        digital experiences.
                    </p>

                </div>

            </div>

            <div class="creative-scroll">
                <span></span>
                EXPLORE
            </div>

        </div>


        <!-- CREATIVE CONTENT -->
        <div class="creative-content">

            <!-- ABOUT -->
            <section class="creative-feature creative-about">

                <div class="creative-number">
                    01
                </div>

                <div class="creative-section-title">
                    <span>INTRODUCTION</span>

                    <h2>
                        About Me
                    </h2>
                </div>

                <div class="creative-about-text">
                    ${lines(
                        portfolio.aboutMe
                    )}
                </div>

            </section>


            <!-- SKILLS -->
            <section class="creative-feature creative-skills">

                <div class="creative-number">
                    02
                </div>

                <div class="creative-section-title">
                    <span>WHAT I DO</span>

                    <h2>
                        My Skills
                    </h2>
                </div>

                <div class="creative-skill-cloud">
                    ${skills(
                        portfolio.skills
                    )}
                </div>

            </section>


            <!-- PROJECTS -->
            <section class="creative-project-feature">

                <div class="creative-project-heading">

                    <div class="creative-number">
                        03
                    </div>

                    <div>
                        <span>
                            SELECTED WORK
                        </span>

                        <h2>
                            Projects
                        </h2>
                    </div>

                </div>

                <div class="creative-project-content">

                    <div class="creative-project-mark">
                        <span>✦</span>
                    </div>

                    <div class="creative-project-text">
                        ${lines(
                            portfolio.projects
                        )}
                    </div>

                </div>

            </section>


            <!-- EDUCATION + EXPERIENCE -->
            <div class="creative-two-column">

                <section class="creative-mini-card">

                    <div class="creative-number">
                        04
                    </div>

                    <span class="creative-mini-label">
                        BACKGROUND
                    </span>

                    <h2>
                        Education
                    </h2>

                    <div class="creative-mini-content">
                        ${lines(
                            portfolio.education
                        )}
                    </div>

                </section>


                <section class="creative-mini-card">

                    <div class="creative-number">
                        05
                    </div>

                    <span class="creative-mini-label">
                        JOURNEY
                    </span>

                    <h2>
                        Experience
                    </h2>

                    <div class="creative-mini-content">
                        ${lines(
                            portfolio.experience
                        )}
                    </div>

                </section>

            </div>


            <!-- CONNECT -->
            <section class="creative-connect">

                <div>

                    <span class="creative-mini-label">
                        LET'S CONNECT
                    </span>

                    <h2>
                        Keep in touch.
                    </h2>

                    <p>
                        Find me online and explore
                        more of my work.
                    </p>

                </div>

                <div class="creative-connect-links">

                    ${social}

                    ${website}

                </div>

            </section>


            <!-- FOOTER -->
            <div class="creative-footer">

                <span>
                    PURPFOLIO
                </span>

                <span>
                    CREATIVE / 03
                </span>

            </div>

        </div>

    </article>
`;
}

/* =========================================
   TEMPLATE SELECTION
========================================= */
document
    .querySelectorAll(".template-card")
    .forEach(card => {

        card.addEventListener(
            "click",
            () => {

                document
                    .querySelectorAll(
                        ".template-card"
                    )
                    .forEach(c => {

                        c.classList.remove(
                            "selected"
                        );

                    });


                card.classList.add(
                    "selected"
                );


                selectedTemplate =
                    card.dataset.template;


                notify(
                    "Template selected: " +
                    selectedTemplate
                );

            }
        );

    });


/* =========================================
   SAVE PORTFOLIO
========================================= */

$("portfolioForm")
    .addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            if (!isSupabaseConfigured()) {

                $("formMessage").textContent =
                    "Please configure Supabase in config.js first.";

                return;

            }


            const id = $("portfolioId").value;
let data;

if (!validateFullName()) {
    fullNameInput.focus();
    $("formMessage").textContent =
        "Please enter a valid full name.";
    return;
}

try {
    data = await formData();

            } catch (error) {

                console.error(error);

                $("formMessage").textContent =
                    error.message ||
                    "Profile picture upload failed.";

                return;

            }

            let result;


            /* =============================
               UPDATE
            ============================= */

            if (id) {

                result =
                    await db
                        .from("portfolios")
                        .update(data)
                        .eq("id", id)
                        .eq("user_id", data.user_id)
                        .select()
                        .single();

            }


            /* =============================
               INSERT
            ============================= */

            else {

                result =
                    await db
                        .from("portfolios")
                        .insert(data)
                        .select()
                        .single();

            }


            /* =============================
               ERROR
            ============================= */

            if (result.error) {

                console.error(
                    result.error
                );

                $("formMessage")
                    .textContent =
                    "Database error: " +
                    result.error.message;

                return;

            }


            /* =============================
               SUCCESS
            ============================= */

            currentPortfolio =
                result.data;


            $("portfolioId").value =
                result.data.id;


            $("formMessage")
                .textContent =
                "Portfolio saved successfully to the online database.";


            notify(
                "Portfolio saved!"
            );


            await loadPortfolios();


           showPage("templates");

        }
    );

/* =========================================
   CLEAR BUTTON
========================================= */

$("clearBtn")
    .addEventListener(
        "click",
        clearForm
    );


/* =========================================
   GENERATE PORTFOLIO
========================================= */

$("generateBtn")
    .addEventListener(
        "click",
        async () => {

            const portfolio =
                currentPortfolio ||
                await formData();


            if (
    !portfolio.full_name ||
    !portfolio.email
)
            {

                notify(
                    "Please save your portfolio first."
                );


                showPage("create");

                return;

            }


            $("portfolioPreview")
                .innerHTML =
                portfolioMarkup(
                    portfolio,
                    selectedTemplate
                );


           showPage("preview");

        }
    );


/* =========================================
   LOAD PORTFOLIOS
========================================= */

async function loadPortfolios() {

    if (!isSupabaseConfigured()) {

        $("portfolioList").innerHTML = `

            <div class="empty-state">

                Connect Supabase in
                <strong>config.js</strong>
                to load saved portfolios.

            </div>

        `;

        return;

    }


    /* =============================
       GET CURRENT USER
    ============================= */

    const {
        data: { user },
        error: userError
    } = await db.auth.getUser();


    if (userError || !user) {

        return;

    }


    /* =============================
       LOAD ONLY USER'S PORTFOLIOS
    ============================= */

    const {
        data,
        error
    } = await db
        .from("portfolios")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", {
            ascending: false
        });


    /* =============================
       DATABASE ERROR
    ============================= */

    if (error) {

        console.error(error);

        $("portfolioList").innerHTML = `

            <div class="empty-state">

                Database Error:
                ${esc(error.message)}

            </div>

        `;

        return;

    }


    /* =============================
       NO PORTFOLIOS
    ============================= */

    if (!data || data.length === 0) {

        $("portfolioList").innerHTML = `

            <div class="empty-state">

                No saved portfolios yet.

                <br><br>

                Create your first portfolio
                using the form above.

            </div>

        `;

        return;

    }


    /* =============================
       DISPLAY PORTFOLIOS
    ============================= */

    $("portfolioList").innerHTML = data
        .map(portfolio => {

            return `

                <div
                    class="portfolio-item"
                >

                    <div>

                        <h3>
                            ${esc(
                                portfolio.full_name
                            )}
                        </h3>

                        <p>
                            ${esc(
                                portfolio.email
                            )}
                        </p>

                    </div>


                    <div
                        class="actions"
                    >

                        <button
                            class="btn ghost"
                            onclick="editPortfolio('${portfolio.id}')"
                        >
                            Edit
                        </button>


                        <button
    class="btn ghost"
    onclick="viewPortfolio('${portfolio.id}')"
>
    View
</button>


                       <button
    class="btn ghost delete-btn"
    onclick="deletePortfolio('${portfolio.id}')"
>
    Delete
</button>

                    </div>

                </div>

            `;

        })
        .join("");

}


/* =========================================
   EDIT PORTFOLIO
========================================= */

window.editPortfolio =
    async function (id) {

        if (!isSupabaseConfigured()) {

            notify(
                "Supabase is not configured."
            );

            return;

        }


        /* =============================
           GET CURRENT USER
        ============================= */

        const {
            data: { user },
            error: userError
        } = await db.auth.getUser();


        if (userError || !user) {

            notify(
                "Please log in first."
            );

            return;

        }


        /* =============================
           LOAD ONLY USER'S PORTFOLIO
        ============================= */

        const {
            data,
            error
        } = await db
            .from("portfolios")
            .select("*")
            .eq("id", id)
            .eq("user_id", user.id)
            .single();


        if (error) {

            notify(
                error.message
            );

            return;

        }


        currentPortfolio = data;

fillForm(data);

$("savePortfolioBtn").textContent = "Save Changes";

showPage("create");


        notify(
            "Portfolio loaded for editing."
        );

    };
/* =========================================
   VIEW PORTFOLIO
========================================= */

window.viewPortfolio =
    async function (id) {

        if (!isSupabaseConfigured()) {

            notify(
                "Supabase is not configured."
            );

            return;

        }


        /* =============================
           GET CURRENT USER
        ============================= */

        const {
            data: { user },
            error: userError
        } = await db.auth.getUser();


        if (userError || !user) {

            notify(
                "Please log in first."
            );

            return;

        }


        /* =============================
           LOAD ONLY USER'S PORTFOLIO
        ============================= */

        const {
            data,
            error
        } = await db
            .from("portfolios")
            .select("*")
            .eq("id", id)
            .eq("user_id", user.id)
            .single();


        if (error) {

            notify(
                error.message
            );

            return;

        }


        currentPortfolio =
            data;


        fillForm(data);


        $("portfolioPreview")
            .innerHTML =
            portfolioMarkup(
                data,
                selectedTemplate
            );


        showPage("preview");

    };


/* =========================================
   DELETE PORTFOLIO
========================================= */

window.deletePortfolio =
    async function (id) {

        if (!isSupabaseConfigured()) {

            notify(
                "Supabase is not configured."
            );

            return;

        }


        /* =============================
           CONFIRM DELETE
        ============================= */

        const confirmation =
            confirm(
                "Are you sure you want to delete this portfolio?"
            );


        if (!confirmation) {

            return;

        }


        /* =============================
           GET CURRENT USER
        ============================= */

        const {
            data: { user },
            error: userError
        } = await db.auth.getUser();


        if (userError || !user) {

            notify(
                "Please log in first."
            );

            return;

        }


        /* =============================
           DELETE ONLY USER'S PORTFOLIO
        ============================= */

        const {
            error
        } = await db
            .from("portfolios")
            .delete()
            .eq("id", id)
            .eq("user_id", user.id);


        if (error) {

            console.error(error);

            notify(
                error.message
            );

            return;

        }


        if (
            currentPortfolio &&
            currentPortfolio.id === id
        ) {

            clearForm();

        }


        await loadPortfolios();


        notify(
            "Portfolio deleted successfully."
        );

    };


/* =========================================
   INITIALIZE
========================================= */

document.querySelectorAll("[data-toggle-password]").forEach(button => {
    button.addEventListener("click", () => {
        const passwordInput = document.getElementById(
            button.dataset.togglePassword
        );

        if (!passwordInput) return;

        const showPassword = passwordInput.type === "password";

        passwordInput.type = showPassword ? "text" : "password";
        button.textContent = showPassword ? "Hide" : "Show";
        button.setAttribute(
            "aria-label",
            showPassword ? "Hide password" : "Show password"
        );
    });
});



/* =========================================
   PRINT PORTFOLIO / SAVE AS PDF
========================================= */

/* PRINT PORTFOLIO IN THE SAME TAB */
window.printPortfolio = function () {
    const preview = document.getElementById("portfolioPreview");
    const portfolio = preview?.querySelector(".portfolio-render");

    if (!portfolio) {
        alert("Please open a portfolio first.");
        return;
    }

    const restorePage = function () {
        document.body.classList.remove("printing-portfolio");
    };

    document.body.classList.add("printing-portfolio");

    // Register before opening the print dialog.
    window.addEventListener("afterprint", restorePage, { once: true });

    window.print();
};


/* SAVE AS PDF — DOWNLOAD DIRECTLY */
window.savePortfolioPDF = async function () {
    const preview = document.getElementById("portfolioPreview");
    const portfolio = preview?.querySelector(".portfolio-render");

    if (!portfolio) {
        alert("Please open a portfolio first.");
        return;
    }

    if (typeof html2pdf === "undefined") {
        alert("PDF library not loaded. Please refresh and try again.");
        return;
    }

    const portfolioName =
        portfolio.querySelector("h1")?.textContent?.trim() || "Portfolio";

    const options = {
        margin: 10,
        filename: portfolioName.replace(/[^a-z0-9_-]/gi, "_") + ".pdf",
        image: {
            type: "jpeg",
            quality: 0.98
        },
        html2canvas: {
            scale: 2,
            useCORS: true,
            backgroundColor: "#ffffff"
        },
        jsPDF: {
            unit: "mm",
            format: "a4",
            orientation: "portrait"
        },
        pagebreak: {
            mode: ["css", "legacy"]
        }
    };

    try {
        if (typeof notify === "function") {
            notify("Creating PDF...");
        }

        await html2pdf()
            .set(options)
            .from(portfolio)
            .save();

        if (typeof notify === "function") {
            notify("PDF downloaded successfully!");
        }
    } catch (error) {
        console.error("PDF generation error:", error);
        alert("Unable to create the PDF. Please try again.");
    }
};






