import { Layout } from "@/components/LayoutWithChat";
import { motion } from "framer-motion";
import { AlertCircle, ArrowLeft, CheckCircle, FileText, Mail, Scale } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

const TermsOfService = () => {
  const { t } = useTranslation();

  const sections = [
    {
      icon: CheckCircle,
      title: t("terms.sections.acceptance.title"),
      content: t("terms.sections.acceptance.content"),
    },
    {
      icon: FileText,
      title: t("terms.sections.services.title"),
      content: t("terms.sections.services.content"),
    },
    {
      icon: AlertCircle,
      title: t("terms.sections.limitations.title"),
      content: t("terms.sections.limitations.content"),
    },
    {
      icon: Scale,
      title: t("terms.sections.liability.title"),
      content: t("terms.sections.liability.content"),
    },
  ];

  return (
    <Layout>
      <Helmet>
        <title>{t("terms.title")} | longsang.org</title>
        <meta name="description" content={t("terms.description")} />
        <meta property="og:title" content={`${t("terms.title")} | longsang.org`} />
        <meta property="og:description" content={t("terms.intro")} />
        <link rel="canonical" href="https://longsang.org/terms" />
      </Helmet>
      <div className="min-h-screen py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            {t("terms.backHome")}
          </Link>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <FileText className="w-16 h-16 text-primary mx-auto mb-4" />
            <h1 className="text-4xl font-bold mb-4">{t("terms.title")}</h1>
            <p className="text-muted-foreground">
              {t("terms.lastUpdated")}: {t("terms.updateDate")}
            </p>
          </motion.div>

          {/* Introduction */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-card/50 border border-border/50 rounded-xl p-6 mb-8"
          >
            <p className="text-foreground/90 leading-relaxed">{t("terms.intro")}</p>
          </motion.div>

          {/* Sections */}
          <div className="space-y-6">
            {sections.map((section, index) => (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
                className="bg-card/30 border border-border/30 rounded-xl p-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <section.icon className="w-6 h-6 text-primary" />
                  <h2 className="text-xl font-semibold">{section.title}</h2>
                </div>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                  {section.content}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Contact */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-12 text-center"
          >
            <p className="text-muted-foreground mb-4">{t("terms.questions")}</p>
            <a
              href="mailto:contact@longsang.org"
              className="inline-flex items-center gap-2 text-primary hover:underline"
            >
              <Mail className="w-4 h-4" />
              contact@longsang.org
            </a>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default TermsOfService;
