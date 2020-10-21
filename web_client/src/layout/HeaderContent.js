import React from "react";
import logo from '../logo.svg';
import Typography from "@material-ui/core/Typography";
import {makeStyles} from "@material-ui/core/styles";

const useStyles = makeStyles(() => ({
    header: {

    }
}))

const HeaderContent = () => {
    const styles = useStyles();
    return (
        <>
            <img alt={'logo'} src={logo} width="50px" height="50px"/>
            <Typography noWrap color={"textSecondary"} className={styles.header}>
                Algorithms
            </Typography>
            <div><Typography>header content</Typography></div>
            <button>Button</button>
        </>
    )
}

export default HeaderContent