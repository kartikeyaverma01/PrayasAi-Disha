from sklearn.feature_extraction.text import TfidfVectorizer


def run_ml_analysis(student_profile):
    """Analyze a student's skills using a lightweight TF-IDF model."""
    skills = student_profile.get("skills", [])

    if isinstance(skills, str):
        skills = [skills]
    elif not isinstance(skills, list):
        skills = []

    skills = [str(skill).strip() for skill in skills if str(skill).strip()]

    if not skills:
        return {
            "status": "completed",
            "model": "TF-IDF",
            "features_analyzed": 0,
            "analyzed_features": [],
            "message": "No student skills supplied for analysis",
        }

    vectorizer = TfidfVectorizer()
    vectorizer.fit_transform([" ".join(skills)])
    analyzed_features = vectorizer.get_feature_names_out().tolist()

    return {
        "status": "completed",
        "model": "TF-IDF",
        "features_analyzed": len(analyzed_features),
        "analyzed_features": analyzed_features,
        "message": "Student skills analyzed successfully",
    }


def analyze_student_profile(profile):
    """Backward-compatible name for the isolated ML analysis function."""
    return run_ml_analysis(profile)