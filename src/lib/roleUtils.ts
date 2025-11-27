export const getHomeUrl = (role?: string) => {
  switch (role) {
    case "ADMIN":
      return "/admin/dashboard";
    case "SUPERVISOR":
      return "/supervisor/dashboard";
    case "TRAINEE":
      return "/trainee/courses";
    default:
      return "/";
  }
};
